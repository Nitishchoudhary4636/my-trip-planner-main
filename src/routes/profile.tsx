import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, User as UserIcon, Mail, Phone, MapPin, Calendar, Globe, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell } from "@/components/PageShell";
import { useAuth, notifyAuthChanged } from "@/hooks/use-auth";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — TripWave" },
      { name: "description", content: "Manage your traveler profile, preferences and contact details." },
      { property: "og:title", content: "My Profile — TripWave" },
      { property: "og:description", content: "Manage your traveler profile, preferences and contact details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", gender: "", dob: "",
    city: "", country: "", passport: "", bio: "",
  });
  const bookingsCount = user ? auth.getBookings(user.id).length : 0;

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dob: user.dob || "",
        city: user.city || "",
        country: user.country || "",
        passport: user.passport || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  if (!user) {
    return (
      <PageShell>
        <section className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">You're not logged in</h1>
          <p className="mt-2 text-muted-foreground">Log in or create an account to view your profile.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login"><Button>Log in</Button></Link>
            <Link to="/register"><Button variant="outline">Sign up</Button></Link>
          </div>
        </section>
      </PageShell>
    );
  }

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = auth.updateProfile(form);
    if (!res.ok) {
      toast.error("Could not update profile", { description: res.error });
      return;
    }
    notifyAuthChanged();
    toast.success("Profile updated");
  };

  const initials = user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        <div className="overflow-hidden rounded-3xl gradient-hero p-8 text-white shadow-elevated md:p-10">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 font-display text-3xl font-extrabold backdrop-blur">
              {initials}
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified traveler
              </div>
              <h1 className="mt-2 font-display text-3xl font-extrabold">{user.fullName}</h1>
              <p className="text-white/85">{user.email}</p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-white/15 px-5 py-3 text-center backdrop-blur">
                <div className="font-display text-2xl font-extrabold">{bookingsCount}</div>
                <div className="text-xs text-white/80">Bookings</div>
              </div>
              <Button onClick={() => navigate({ to: "/my-bookings" })} className="bg-white text-brand-teal-deep hover:bg-white/90">View bookings</Button>
            </div>
          </div>
        </div>

        <form onSubmit={onSave} className="mt-8 grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-soft md:grid-cols-2 md:p-8">
          <h2 className="font-display text-2xl font-bold md:col-span-2">Personal details</h2>

          <Field label="Full name" icon={<UserIcon className="h-4 w-4 text-brand-teal" />}>
            <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
          </Field>
          <Field label="Email" icon={<Mail className="h-4 w-4 text-brand-teal" />}>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </Field>
          <Field label="Phone" icon={<Phone className="h-4 w-4 text-brand-teal" />}>
            <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Date of birth" icon={<Calendar className="h-4 w-4 text-brand-teal" />}>
            <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
          </Field>
          <Field label="Gender">
            <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="na">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Passport number">
            <Input value={form.passport} onChange={(e) => set("passport", e.target.value)} placeholder="A1234567" />
          </Field>
          <Field label="City" icon={<MapPin className="h-4 w-4 text-brand-teal" />}>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Country" icon={<Globe className="h-4 w-4 text-brand-teal" />}>
            <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">About me</Label>
            <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} placeholder="Adventure-loving foodie. Beach > mountains, but ask me again next week…" className="mt-1" />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" size="lg" className="gradient-cta border-0 px-8 text-white shadow-cta hover:opacity-95">
              <Save className="mr-2 h-4 w-4" /> Save changes
            </Button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-1 flex items-center gap-2 [&>*]:flex-1">
        {icon && <span className="flex-none">{icon}</span>}
        {children}
      </div>
    </div>
  );
}
