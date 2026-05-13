import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CreditCard, Landmark, ShieldCheck, Smartphone, TicketCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/PageShell";
import { auth } from "@/lib/auth";
import { downloadBookingPdf } from "@/lib/ticket-pdf";
import { useAuth, notifyAuthChanged } from "@/hooks/use-auth";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — TripWave" },
      { name: "description", content: "Complete payment to confirm your booking instantly." },
      { property: "og:title", content: "Checkout — TripWave" },
      { property: "og:description", content: "Complete payment to confirm your booking instantly." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const pending = auth.getPendingBooking(user?.id);

  const [method, setMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [busy, setBusy] = useState(false);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");

  const payable = useMemo(() => {
    if (!pending) return 0;
    const convenienceFee = Math.round(pending.amount * 0.02);
    return pending.amount + convenienceFee;
  }, [pending]);

  if (!user) {
    return (
      <PageShell>
        <section className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">Log in to continue checkout</h1>
          <p className="mt-2 text-muted-foreground">You need an account to complete payment.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login"><Button>Log in</Button></Link>
            <Link to="/register"><Button variant="outline">Sign up</Button></Link>
          </div>
        </section>
      </PageShell>
    );
  }

  if (!pending) {
    return (
      <PageShell>
        <section className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">No booking in checkout</h1>
          <p className="mt-2 text-muted-foreground">Start from flights, hotels, trains, buses, holidays, or cabs to continue.</p>
          <Link to="/" className="mt-6 inline-block"><Button>Go to home</Button></Link>
        </section>
      </PageShell>
    );
  }

  const validatePayment = (): string | null => {
    if (method === "card") {
      if (!cardName.trim()) return "Card holder name is required.";
      if (cardNumber.replace(/\s/g, "").length < 14) return "Enter a valid card number.";
      if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Use expiry format MM/YY.";
      if (!/^\d{3,4}$/.test(cvv)) return "Enter a valid CVV.";
    }

    if (method === "upi") {
      if (!/^[\w.-]{2,}@[\w.-]{2,}$/.test(upiId.trim())) return "Enter a valid UPI ID.";
    }

    if (method === "netbanking") {
      if (!bank.trim()) return "Please select a bank.";
    }

    return null;
  };

  const payNow = () => {
    const validationError = validatePayment();
    if (validationError) {
      toast.error("Payment details are incomplete", { description: validationError });
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      const booking = auth.completePendingBooking(method);
      setBusy(false);

      if (!booking) {
        toast.error("Checkout expired", { description: "Please start your booking again." });
        navigate({ to: "/" });
        return;
      }

      notifyAuthChanged();
      downloadBookingPdf(booking, user);
      toast.success("Payment successful", {
        description: `Booking ${booking.bookingCode} confirmed. PDF ticket downloaded.`,
      });
      navigate({ to: "/my-bookings" });
    }, 900);
  };

  const convenienceFee = Math.round(pending.amount * 0.02);

  return (
    <PageShell>
      <section className="gradient-sky">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="rounded-3xl border border-border/70 bg-white/70 p-5 shadow-soft backdrop-blur-sm md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-brand-teal-deep">Secure checkout</div>
                <h1 className="font-display text-3xl font-extrabold">Complete your booking</h1>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" /> 256-bit encrypted payment
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated">
              <h2 className="font-display text-2xl font-extrabold">Choose payment method</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`rounded-2xl border p-3 text-left transition-colors ${method === "card" ? "border-brand-teal bg-secondary" : "border-border hover:bg-secondary/50"}`}
                >
                  <CreditCard className="h-5 w-5 text-brand-teal" />
                  <div className="mt-2 text-sm font-semibold">Card</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("upi")}
                  className={`rounded-2xl border p-3 text-left transition-colors ${method === "upi" ? "border-brand-teal bg-secondary" : "border-border hover:bg-secondary/50"}`}
                >
                  <Smartphone className="h-5 w-5 text-brand-teal" />
                  <div className="mt-2 text-sm font-semibold">UPI</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("netbanking")}
                  className={`rounded-2xl border p-3 text-left transition-colors ${method === "netbanking" ? "border-brand-teal bg-secondary" : "border-border hover:bg-secondary/50"}`}
                >
                  <Landmark className="h-5 w-5 text-brand-teal" />
                  <div className="mt-2 text-sm font-semibold">Net Banking</div>
                </button>
              </div>

              {method === "card" && (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Field label="Card holder name" className="md:col-span-2">
                    <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Ravi Kumar" />
                  </Field>
                  <Field label="Card number" className="md:col-span-2">
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))}
                      placeholder="4111 1111 1111 1111"
                    />
                  </Field>
                  <Field label="Expiry (MM/YY)">
                    <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="09/29" />
                  </Field>
                  <Field label="CVV">
                    <Input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" />
                  </Field>
                </div>
              )}

              {method === "upi" && (
                <div className="mt-5">
                  <Field label="UPI ID">
                    <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@okicici" />
                  </Field>
                  <p className="mt-2 text-xs text-muted-foreground">You will receive a collect request in your UPI app.</p>
                </div>
              )}

              {method === "netbanking" && (
                <div className="mt-5">
                  <Field label="Bank name">
                    <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="HDFC Bank" />
                  </Field>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                <Link to="/" className="text-sm font-semibold text-brand-teal-deep hover:underline">Back to search</Link>
                <Button onClick={payNow} disabled={busy} size="lg" className="gradient-cta border-0 px-8 text-white shadow-cta hover:opacity-95">
                  {busy ? "Processing..." : `Pay ₹${payable.toLocaleString("en-IN")}`}
                </Button>
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-xl font-extrabold">Booking summary</h3>
              <p className="mt-1 text-sm text-muted-foreground">{pending.title}</p>

              <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-teal-deep">
                  <TicketCheck className="h-4 w-4" /> {pending.type} booking
                </div>
                <dl className="mt-3 space-y-1 text-sm">
                  {Object.entries(pending.details)
                    .filter(([, v]) => v !== "" && v !== undefined)
                    .slice(0, 6)
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3">
                        <dt className="capitalize text-muted-foreground">{k}</dt>
                        <dd className="font-medium text-foreground">{String(v)}</dd>
                      </div>
                    ))}
                </dl>
              </div>

              <div className="mt-5 space-y-2 rounded-2xl border border-border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Base fare</span>
                  <span>₹{pending.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Convenience fee</span>
                  <span>₹{convenienceFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 text-base font-extrabold">
                  <span>Total payable</span>
                  <span className="text-brand-orange-deep">₹{payable.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                <li>Free cancellation available on select services.</li>
                <li>Invoice and confirmation will appear in My Bookings.</li>
                <li>Support is available 24x7 for payment issues.</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
