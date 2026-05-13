import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plane, Hotel, Palmtree, Train, Bus, Car, Trash2, Calendar, Download, ArrowUpDown, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { useAuth, notifyAuthChanged } from "@/hooks/use-auth";
import { auth, type Booking } from "@/lib/auth";
import { downloadBookingPdf } from "@/lib/ticket-pdf";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — TripWave" },
      { name: "description", content: "View and manage your saved trip searches and bookings." },
      { property: "og:title", content: "My Bookings — TripWave" },
      { property: "og:description", content: "View and manage your saved trip searches and bookings." },
    ],
  }),
  component: MyBookingsPage,
});

const iconFor = {
  flight: Plane, hotel: Hotel, holiday: Palmtree, train: Train, bus: Bus, cab: Car,
} as const;

function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | Booking["type"]>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    if (user) setBookings(auth.getBookings(user.id));
  }, [user]);

  if (!user) {
    return (
      <PageShell>
        <section className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">Log in to see your bookings</h1>
          <p className="mt-2 text-muted-foreground">Your saved trips and searches live here.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login"><Button>Log in</Button></Link>
            <Link to="/register"><Button variant="outline">Sign up</Button></Link>
          </div>
        </section>
      </PageShell>
    );
  }

  const remove = (id: string) => {
    auth.deleteBooking(id);
    setBookings(auth.getBookings(user.id));
    notifyAuthChanged();
    toast.success("Booking removed");
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.type === filter);
  const ordered = [...filtered].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return sort === "newest" ? tb - ta : ta - tb;
  });
  const types: ("all" | Booking["type"])[] = ["all", "flight", "hotel", "holiday", "train", "bus", "cab"];
  const totalPaid = ordered.reduce((sum, b) => sum + (b.amount || 0), 0);

  const exportCsv = () => {
    if (ordered.length === 0) {
      toast.error("Nothing to export");
      return;
    }

    const rows = ordered.map((b) => ({
      id: b.id,
      type: b.type,
      title: b.title,
      createdAt: b.createdAt,
      details: Object.entries(b.details)
        .map(([k, v]) => `${k}:${String(v)}`)
        .join(" | "),
    }));

    const header = Object.keys(rows[0]);
    const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const csv = [header.join(","), ...rows.map((r) => header.map((k) => esc(r[k as keyof typeof r])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tripwave-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Bookings exported");
  };

  const clearAll = () => {
    if (!user) return;
    auth.clearBookingsForUser(user.id);
    setBookings([]);
    notifyAuthChanged();
    toast.success("All bookings removed");
  };

  const downloadPdf = (booking: Booking) => {
    downloadBookingPdf(booking, user);
    toast.success("Ticket PDF downloaded");
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange-deep">Your trips</div>
            <h1 className="mt-1 font-display text-4xl font-extrabold">My Bookings</h1>
            <p className="mt-1 text-muted-foreground">
              {bookings.length} confirmed {bookings.length === 1 ? "booking" : "bookings"} • Total paid ₹{totalPaid.toLocaleString("en-IN")}
            </p>
          </div>
          <Link to="/"><Button variant="outline">Plan another trip</Button></Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                filter === t ? "gradient-cta border-transparent text-white shadow-cta" : "border-border bg-card hover:bg-secondary"
              }`}
            >
              {t}
            </button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
            className="ml-auto"
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sort === "newest" ? "Newest first" : "Oldest first"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm" disabled={bookings.length === 0}>
                Clear all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all bookings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove every saved booking for your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {ordered.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Palmtree className="mx-auto h-10 w-10 text-brand-teal" />
            <h2 className="mt-4 font-display text-2xl font-bold">No bookings yet</h2>
            <p className="mt-1 text-muted-foreground">Start planning your next adventure.</p>
            <Link to="/" className="mt-5 inline-block">
              <Button className="gradient-cta border-0 text-white shadow-cta hover:opacity-95">Search trips</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {ordered.map((b) => {
              const Icon = iconFor[b.type];
              return (
                <div key={b.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl gradient-cta text-white shadow-cta">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-brand-teal-deep">{b.type}</span>
                        <Calendar className="h-3 w-3" />
                        {new Date(b.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <h3 className="mt-1 font-display text-lg font-bold">{b.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800">
                          <CircleCheck className="h-3.5 w-3.5" /> {b.status === "confirmed" ? "Confirmed" : b.status}
                        </span>
                        {b.bookingCode && <span className="rounded-full bg-secondary px-2.5 py-1 font-semibold text-brand-teal-deep">{b.bookingCode}</span>}
                        <span className="rounded-full bg-brand-sand px-2.5 py-1 font-semibold text-brand-orange-deep">₹{(b.amount || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {Object.entries(b.details).filter(([, v]) => v !== "" && v !== undefined).slice(0, 6).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2 truncate">
                            <dt className="capitalize">{k}</dt>
                            <dd className="truncate font-medium text-foreground">{String(v)}</dd>
                          </div>
                        ))}
                      </dl>
                      {b.paymentMethod && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Paid via {b.paymentMethod.toUpperCase()}
                          {b.paidAt ? ` on ${new Date(b.paidAt).toLocaleDateString()}` : ""}
                          {b.transactionId ? ` • TXN ${b.transactionId}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" onClick={() => downloadPdf(b)} aria-label="Download ticket PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(b.id)} aria-label="Remove">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
