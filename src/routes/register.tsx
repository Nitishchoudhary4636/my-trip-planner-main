import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User as UserIcon, Phone, UserPlus, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell } from "@/components/PageShell";
import { auth } from "@/lib/auth";
import { notifyAuthChanged } from "@/hooks/use-auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your TripWave account" },
      { name: "description", content: "Sign up free to save searches, plan trips and manage bookings." },
      { property: "og:title", content: "Create your TripWave account" },
      { property: "og:description", content: "Sign up free to save searches, plan trips and manage bookings." },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Phone too short").max(20).optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  gender: z.string().optional(),
  dob: z.string().optional(),
  city: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "",
    gender: "", dob: "", city: "", country: "India",
  });
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error("Please check the form", { description: parsed.error.issues[0]?.message });
      return;
    }
    setBusy(true);
    const res = await auth.register(parsed.data as typeof form);
    setBusy(false);
    if (!res.ok) {
      toast.error("Sign up failed", { description: res.error });
      return;
    }
    notifyAuthChanged();
    toast.success("Account created!", { description: "Welcome to TripWave." });
    navigate({ to: "/profile" });
  };

  return (
    <PageShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1fr_1.2fr] md:px-6">
        <div className="hidden rounded-3xl gradient-hero p-10 text-white shadow-elevated md:flex md:flex-col md:justify-between">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-tight">Start your journey</h2>
            <p className="mt-3 text-white/85">Save your favorite trips, get tailored deals, and never lose a search again.</p>
            <ul className="mt-6 space-y-2 text-sm text-white/90">
              <li>✓ Free to sign up</li>
              <li>✓ Save unlimited bookings & searches</li>
              <li>✓ Manage your profile & preferences</li>
            </ul>
          </div>
          <p className="text-xs text-white/70">Demo notice: data is stored in your browser only.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <h1 className="font-display text-3xl font-extrabold">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fill in your details to get started.</p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <FieldLabel label="Full name" icon={<UserIcon className="h-4 w-4 text-brand-teal" />} className="md:col-span-2">
              <Input required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Aarav Sharma" />
            </FieldLabel>
            <FieldLabel label="Email" icon={<Mail className="h-4 w-4 text-brand-teal" />}>
              <Input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </FieldLabel>
            <FieldLabel label="Phone" icon={<Phone className="h-4 w-4 text-brand-teal" />}>
              <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
            </FieldLabel>
            <FieldLabel label="Password" icon={<Lock className="h-4 w-4 text-brand-teal" />} className="md:col-span-2">
              <Input type="password" required value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 6 characters" />
            </FieldLabel>
            <FieldLabel label="Gender">
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="na">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </FieldLabel>
            <FieldLabel label="Date of birth" icon={<Calendar className="h-4 w-4 text-brand-teal" />}>
              <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
            </FieldLabel>
            <FieldLabel label="City" icon={<MapPin className="h-4 w-4 text-brand-teal" />}>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Bengaluru" />
            </FieldLabel>
            <FieldLabel label="Country">
              <Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="India" />
            </FieldLabel>

            <div className="mt-2 md:col-span-2">
              <Button type="submit" size="lg" disabled={busy} className="w-full gradient-cta border-0 text-white shadow-cta hover:opacity-95">
                <UserPlus className="mr-2 h-4 w-4" /> {busy ? "Creating…" : "Create account"}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-orange-deep hover:underline">Log in</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function FieldLabel({ label, icon, className, children }: { label: string; icon?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-input bg-background px-3 [&_input]:border-0 [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&>div]:flex-1 [&>button]:flex-1 [&>button]:border-0 [&>button]:shadow-none">
        {icon}
        {children}
      </div>
    </div>
  );
}
