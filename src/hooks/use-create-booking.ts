import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { auth, type Booking } from "@/lib/auth";
import { notifyAuthChanged } from "@/hooks/use-auth";

type BookingInput = Pick<Booking, "type" | "title" | "details">;
type BookingCreateInput = BookingInput & { amount?: number };

function safeNumber(v: string | number | undefined, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function nightsBetween(checkin?: string | number, checkout?: string | number): number {
  if (typeof checkin !== "string" || typeof checkout !== "string") return 1;
  const start = new Date(checkin).getTime();
  const end = new Date(checkout).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 1;
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

function estimateAmount(b: BookingInput): number {
  const d = b.details;
  switch (b.type) {
    case "flight": {
      const adults = safeNumber(d.adults, 1);
      const children = safeNumber(d.children, 0);
      const classMultiplier = d.class === "business" ? 2.2 : d.class === "first" ? 3 : d.class === "premium" ? 1.5 : 1;
      const tripMultiplier = d.tripType === "roundtrip" ? 1.8 : 1;
      return Math.round((adults * 6200 + children * 3400) * classMultiplier * tripMultiplier);
    }
    case "hotel": {
      const rooms = safeNumber(d.rooms, 1);
      const perNight = safeNumber(d.maxBudget, 4500);
      const nights = nightsBetween(d.checkin, d.checkout);
      return Math.round(rooms * perNight * nights * 0.82);
    }
    case "holiday": {
      const travelers = safeNumber(d.travelers, 2);
      const budget = safeNumber(d.budget, 50000);
      return Math.round(Math.max(12000, budget * 0.6) + travelers * 2500);
    }
    case "train": {
      const passengers = safeNumber(d.passengers, 1);
      return Math.round(900 * passengers + 120);
    }
    case "bus": {
      const seats = safeNumber(d.seats, 1);
      return Math.round(750 * seats + 90);
    }
    case "cab": {
      const hours = safeNumber(d.hours, 4);
      const base = d.tripType === "rental" ? 380 * hours : d.tripType === "airport" ? 999 : 1850;
      return Math.round(base + 120);
    }
    default:
      return 999;
  }
}

export function useCreateBooking() {
  const navigate = useNavigate();
  return (b: BookingCreateInput) => {
    const user = auth.getCurrentUser();
    if (!user) {
      toast.error("Please log in to continue", { description: "You need an account to save searches & bookings." });
      navigate({ to: "/login" });
      return;
    }

    const amount = b.amount && b.amount > 0 ? b.amount : estimateAmount(b);
    auth.setPendingBooking({
      ...b,
      userId: user.id,
      amount,
      currency: "INR",
    });

    notifyAuthChanged();
    toast.success("Review and pay to confirm", { description: `Proceeding to secure checkout for ${b.title}` });
    navigate({ to: "/checkout" });
  };
}
