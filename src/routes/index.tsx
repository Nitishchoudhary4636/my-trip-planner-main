import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plane, Hotel, Palmtree, Train, Bus, Car, Search, MapPin, Calendar, Users, ArrowRight, Star, Shield, Headphones, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/PageShell";
import { useCreateBooking } from "@/hooks/use-create-booking";
import hero from "@/assets/hero-travel.jpg";
import bali from "@/assets/dest-bali.jpg";
import manali from "@/assets/dest-manali.jpg";
import maldives from "@/assets/dest-maldives.jpg";
import dubai from "@/assets/dest-dubai.jpg";
import goa from "@/assets/dest-goa.jpg";
import jaipur from "@/assets/dest-jaipur.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TripWave — Plan Smarter Trips. Flights, Hotels & Holidays" },
      { name: "description", content: "Search flights, book hotels, plan holidays, trains, buses & cabs — all in one place." },
      { property: "og:title", content: "TripWave — Plan Smarter Trips" },
      { property: "og:description", content: "Search flights, book hotels, plan holidays, trains, buses & cabs — all in one place." },
    ],
  }),
  component: HomePage,
});

const tabs = [
  { key: "flights", label: "Flights", icon: Plane, to: "/flights" },
  { key: "hotels", label: "Hotels", icon: Hotel, to: "/hotels" },
  { key: "holidays", label: "Holidays", icon: Palmtree, to: "/holidays" },
  { key: "trains", label: "Trains", icon: Train, to: "/trains" },
  { key: "buses", label: "Buses", icon: Bus, to: "/buses" },
  { key: "cabs", label: "Cabs", icon: Car, to: "/cabs" },
] as const;

const destinations = [
  { name: "Bali", country: "Indonesia", img: bali, price: "₹38,999" },
  { name: "Manali", country: "India", img: manali, price: "₹12,499" },
  { name: "Maldives", country: "Maldives", img: maldives, price: "₹64,999" },
  { name: "Dubai", country: "UAE", img: dubai, price: "₹42,999" },
  { name: "Goa", country: "India", img: goa, price: "₹8,999" },
  { name: "Jaipur", country: "India", img: jaipur, price: "₹6,499" },
];

function HomePage() {
  const [active, setActive] = useState<typeof tabs[number]["key"]>("flights");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const createBooking = useCreateBooking();

  const tab = tabs.find((t) => t.key === active)!;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const typeMap = {
      flights: "flight", hotels: "hotel", holidays: "holiday",
      trains: "train", buses: "bus", cabs: "cab",
    } as const;
    createBooking({
      type: typeMap[active],
      title: `${tab.label}: ${from || "Anywhere"} → ${to || "Anywhere"}`,
      details: { from, to, date, travelers },
    });
  };

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={hero} alt="Tropical coastline at sunset" width={1920} height={1024} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-teal-deep/70 via-brand-teal-deep/40 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-32 md:px-6 md:pt-24 md:pb-44">
          <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur">
            #1 Trip Planner
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] text-white md:text-6xl lg:text-7xl">
            Your next adventure, <span className="text-brand-orange">beautifully planned.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">
            Compare flights, lock-in hotels, build dream itineraries — all in one place.
          </p>
        </div>

        {/* SEARCH WIDGET */}
        <div className="relative mx-auto -mt-24 max-w-6xl px-4 md:px-6 md:-mt-32">
          <div className="overflow-hidden rounded-3xl bg-card shadow-elevated ring-1 ring-border">
            <div className="flex flex-wrap gap-1 border-b border-border bg-secondary/40 p-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    active === t.key
                      ? "gradient-cta text-white shadow-cta"
                      : "text-foreground/70 hover:bg-white"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} className="grid gap-4 p-5 md:grid-cols-5 md:p-6">
              <div className="md:col-span-1">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">From</Label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
                  <MapPin className="h-4 w-4 text-brand-teal" />
                  <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Delhi" className="h-auto border-0 p-0 shadow-none focus-visible:ring-0" />
                </div>
              </div>
              <div className="md:col-span-1">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">To</Label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
                  <MapPin className="h-4 w-4 text-brand-orange" />
                  <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Goa" className="h-auto border-0 p-0 shadow-none focus-visible:ring-0" />
                </div>
              </div>
              <div className="md:col-span-1">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</Label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-brand-teal" />
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-auto border-0 p-0 shadow-none focus-visible:ring-0" />
                </div>
              </div>
              <div className="md:col-span-1">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Travelers</Label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
                  <Users className="h-4 w-4 text-brand-teal" />
                  <Input type="number" min={1} max={10} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} className="h-auto border-0 p-0 shadow-none focus-visible:ring-0" />
                </div>
              </div>
              <div className="flex items-end md:col-span-1">
                <Button type="submit" className="h-12 w-full gradient-cta border-0 text-base font-semibold text-white shadow-cta hover:opacity-95">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {tabs.map((t) => (
            <Link key={t.key} to={t.to} className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-brand-teal-deep transition-colors group-hover:gradient-cta group-hover:text-white">
                <t.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange-deep">Trending now</div>
            <h2 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">Top destinations to explore</h2>
          </div>
          <Link to="/holidays" className="hidden items-center gap-1 text-sm font-semibold text-brand-teal-deep hover:underline md:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Link to="/holidays" key={d.name} className="group relative overflow-hidden rounded-3xl shadow-soft">
              <img src={d.img} alt={d.name} loading="lazy" width={800} height={640} className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/80">{d.country}</div>
                    <h3 className="font-display text-2xl font-extrabold">{d.name}</h3>
                  </div>
                  <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">from {d.price}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: Wallet, title: "Best price guarantee", desc: "Find a lower fare? We match it." },
            { icon: Shield, title: "Secure checkout", desc: "Encrypted payments & data." },
            { icon: Headphones, title: "24/7 support", desc: "Real humans, anytime, anywhere." },
            { icon: Star, title: "Loved by 2M+ travelers", desc: "Rated 4.8 across app stores." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-brand-teal-deep">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-6">
        <div className="overflow-hidden rounded-3xl gradient-hero p-10 text-center text-white shadow-elevated md:p-16">
          <h2 className="font-display text-3xl font-extrabold md:text-5xl">Ready to wander?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Create a free account, save searches, and pick up where you left off across devices.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register"><Button size="lg" className="bg-white text-brand-teal-deep hover:bg-white/90">Create account</Button></Link>
            <Link to="/holidays"><Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">Browse trips</Button></Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
