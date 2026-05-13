import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, LogIn, Plane } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/PageShell";
import { auth } from "@/lib/auth";
import { notifyAuthChanged } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — TripWave" },
      { name: "description", content: "Log in to your TripWave account to manage trips and bookings." },
      { property: "og:title", content: "Log in — TripWave" },
      { property: "og:description", content: "Log in to your TripWave account to manage trips and bookings." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await auth.login(email.trim(), password);
    setBusy(false);
    if (!res.ok) {
      toast.error("Login failed", { description: res.error });
      return;
    }
    notifyAuthChanged();
    toast.success(`Welcome back, ${res.user!.fullName.split(" ")[0]}!`);
    navigate({ to: "/profile" });
  };

  return (
    <PageShell>
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-16 md:grid-cols-2 md:px-6">
        <div className="hidden rounded-3xl gradient-hero p-10 text-white shadow-elevated md:flex md:flex-col md:justify-between">
          <div>
            <Plane className="h-8 w-8" />
            <h2 className="mt-6 font-display text-4xl font-extrabold leading-tight">Welcome back, traveler.</h2>
            <p className="mt-3 text-white/85">Pick up where you left off — your saved searches and bookings are waiting.</p>
          </div>
          <p className="text-xs text-white/70">Demo notice: data is stored in your browser only.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <h1 className="font-display text-3xl font-extrabold">Log in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use the email and password you signed up with.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-input bg-background px-3">
                <Mail className="h-4 w-4 text-brand-teal" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="border-0 shadow-none focus-visible:ring-0" />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-input bg-background px-3">
                <Lock className="h-4 w-4 text-brand-teal" />
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="border-0 shadow-none focus-visible:ring-0" />
              </div>
            </div>
            <Button type="submit" disabled={busy} size="lg" className="w-full gradient-cta border-0 text-white shadow-cta hover:opacity-95">
              <LogIn className="mr-2 h-4 w-4" /> {busy ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-brand-orange-deep hover:underline">Sign up</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
