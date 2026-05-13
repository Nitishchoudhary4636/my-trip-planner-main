// Lightweight localStorage-based auth (demo only — not secure).
export type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  gender?: string;
  dob?: string;
  city?: string;
  country?: string;
  passport?: string;
  bio?: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  userId: string;
  type: "flight" | "hotel" | "holiday" | "train" | "bus" | "cab";
  title: string;
  details: Record<string, string | number>;
  amount: number;
  currency: "INR";
  status: "confirmed";
  paymentMethod?: "card" | "upi" | "netbanking";
  transactionId?: string;
  paidAt?: string;
  bookingCode?: string;
  createdAt: string;
};

export type PendingBooking = {
  userId: string;
  type: Booking["type"];
  title: string;
  details: Booking["details"];
  amount: number;
  currency: "INR";
  createdAt: string;
};

const USERS_KEY = "tw_users";
const SESSION_KEY = "tw_session";
const BOOKINGS_KEY = "tw_bookings";
const PENDING_BOOKING_KEY = "tw_pending_booking";
const HASH_PREFIX = "sha256:";

// Server-side storage (in-memory map for non-browser environments)
const serverStorage = new Map<string, string>();

function createId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }

  if (c && typeof c.getRandomValues === "function") {
    const bytes = c.getRandomValues(new Uint8Array(16));
    // RFC 4122 version 4 UUID bits.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    // Server-side: use in-memory map
    try {
      const v = serverStorage.get(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  }
  // Client-side: use localStorage
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") {
    // Server-side: use in-memory map
    serverStorage.set(key, JSON.stringify(val));
    return;
  }
  // Client-side: use localStorage
  window.localStorage.setItem(key, JSON.stringify(val));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function createBookingCode(type: Booking["type"]): string {
  const prefixMap: Record<Booking["type"], string> = {
    flight: "FL",
    hotel: "HT",
    holiday: "HD",
    train: "TR",
    bus: "BS",
    cab: "CB",
  };
  const stamp = Date.now().toString().slice(-8);
  return `TW${prefixMap[type]}${stamp}`;
}

function hashFallback(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return Math.abs(hash >>> 0).toString(16).padStart(8, "0");
}

async function hashPassword(password: string): Promise<string> {
  const c = globalThis.crypto;
  if (c?.subtle) {
    const bytes = new TextEncoder().encode(password);
    const digest = await c.subtle.digest("SHA-256", bytes);
    const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
    return `${HASH_PREFIX}${hex}`;
  }
  return `${HASH_PREFIX}${hashFallback(password)}`;
}

async function verifyPassword(storedPassword: string, candidate: string): Promise<{ ok: boolean; needsMigration: boolean }> {
  if (storedPassword.startsWith(HASH_PREFIX)) {
    return { ok: storedPassword === await hashPassword(candidate), needsMigration: false };
  }

  return { ok: storedPassword === candidate, needsMigration: true };
}

export const auth = {
  getUsers: () => read<User[]>(USERS_KEY, []),
  getCurrentUser: (): User | null => {
    const id = read<string | null>(SESSION_KEY, null);
    if (!id) return null;
    return auth.getUsers().find((u) => u.id === id) ?? null;
  },
  register: async (data: Omit<User, "id" | "createdAt">): Promise<{ ok: boolean; error?: string; user?: User }> => {
    const users = auth.getUsers();
    const email = normalizeEmail(data.email);
    if (users.some((u) => normalizeEmail(u.email) === email)) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const user: User = {
      ...data,
      fullName: normalizeName(data.fullName),
      email,
      password: await hashPassword(data.password),
      id: createId(),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    write(USERS_KEY, users);
    write(SESSION_KEY, user.id);
    return { ok: true, user };
  },
  login: async (email: string, password: string): Promise<{ ok: boolean; error?: string; user?: User }> => {
    const normalizedEmail = normalizeEmail(email);
    const users = auth.getUsers();
    const idx = users.findIndex((u) => normalizeEmail(u.email) === normalizedEmail);
    if (idx < 0) return { ok: false, error: "Invalid email or password." };

    const user = users[idx];
    const verified = await verifyPassword(user.password, password);
    if (!verified.ok) return { ok: false, error: "Invalid email or password." };

    if (verified.needsMigration) {
      users[idx] = { ...user, password: await hashPassword(password) };
      write(USERS_KEY, users);
    }

    write(SESSION_KEY, user.id);
    return { ok: true, user };
  },
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_KEY);
    } else {
      serverStorage.delete(SESSION_KEY);
    }
  },
  updateProfile: (patch: Partial<User>): { ok: boolean; error?: string; user?: User } => {
    const cur = auth.getCurrentUser();
    if (!cur) return { ok: false, error: "You must be logged in." };

    const users = auth.getUsers();
    const idx = users.findIndex((u) => u.id === cur.id);
    if (idx < 0) return { ok: false, error: "Profile not found." };

    const nextEmail = patch.email ? normalizeEmail(patch.email) : users[idx].email;
    if (
      nextEmail !== users[idx].email &&
      users.some((u) => u.id !== cur.id && normalizeEmail(u.email) === nextEmail)
    ) {
      return { ok: false, error: "Another account already uses that email." };
    }

    users[idx] = {
      ...users[idx],
      ...patch,
      id: cur.id,
      fullName: patch.fullName ? normalizeName(patch.fullName) : users[idx].fullName,
      email: nextEmail,
    };
    write(USERS_KEY, users);
    return { ok: true, user: users[idx] };
  },
  getBookings: (userId?: string): Booking[] => {
    const all = read<Booking[]>(BOOKINGS_KEY, []);
    return userId ? all.filter((b) => b.userId === userId) : all;
  },
  getPendingBooking: (userId?: string): PendingBooking | null => {
    const pending = read<PendingBooking | null>(PENDING_BOOKING_KEY, null);
    if (!pending) return null;
    if (!userId) return pending;
    return pending.userId === userId ? pending : null;
  },
  setPendingBooking: (pending: Omit<PendingBooking, "createdAt">): PendingBooking => {
    const withCreatedAt: PendingBooking = { ...pending, createdAt: new Date().toISOString() };
    write(PENDING_BOOKING_KEY, withCreatedAt);
    return withCreatedAt;
  },
  clearPendingBooking: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(PENDING_BOOKING_KEY);
    } else {
      serverStorage.delete(PENDING_BOOKING_KEY);
    }
  },
  addBooking: (b: Omit<Booking, "id" | "createdAt">): Booking => {
    const all = read<Booking[]>(BOOKINGS_KEY, []);
    const booking: Booking = {
      ...b,
      id: createId(),
      amount: Number.isFinite(b.amount) ? b.amount : 0,
      currency: b.currency ?? "INR",
      status: "confirmed",
      bookingCode: b.bookingCode ?? createBookingCode(b.type),
      createdAt: new Date().toISOString(),
    };
    all.unshift(booking);
    write(BOOKINGS_KEY, all);
    return booking;
  },
  completePendingBooking: (paymentMethod: Booking["paymentMethod"]): Booking | null => {
    const pending = auth.getPendingBooking();
    if (!pending) return null;

    const booking = auth.addBooking({
      userId: pending.userId,
      type: pending.type,
      title: pending.title,
      details: pending.details,
      amount: pending.amount,
      currency: pending.currency,
      status: "confirmed",
      paymentMethod,
      transactionId: createId().replaceAll("-", "").toUpperCase().slice(0, 12),
      paidAt: new Date().toISOString(),
      bookingCode: createBookingCode(pending.type),
    });

    auth.clearPendingBooking();
    return booking;
  },
  deleteBooking: (id: string) => {
    const all = read<Booking[]>(BOOKINGS_KEY, []);
    write(BOOKINGS_KEY, all.filter((b) => b.id !== id));
  },
  clearBookingsForUser: (userId: string) => {
    const all = read<Booking[]>(BOOKINGS_KEY, []);
    write(BOOKINGS_KEY, all.filter((b) => b.userId !== userId));
  },
};
