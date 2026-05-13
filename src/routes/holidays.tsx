import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Palmtree, Calendar, Users, Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { SearchResultsList } from "@/components/SearchResultsList";
import { useCreateBooking } from "@/hooks/use-create-booking";
import { generateTravelOptions, type TravelOption } from "@/lib/travel-options";
import hero from "@/assets/dest-bali.jpg";
import bali from "@/assets/dest-bali.jpg";
import maldives from "@/assets/dest-maldives.jpg";
import dubai from "@/assets/dest-dubai.jpg";
import manali from "@/assets/dest-manali.jpg";
import goa from "@/assets/dest-goa.jpg";
import jaipur from "@/assets/dest-jaipur.jpg";

export const Route = createFileRoute("/holidays")({
  head: () => ({
    meta: [
      { title: "Holiday Packages — TripWave" },
      { name: "description", content: "Curated holiday packages — beach, mountain, heritage, luxury." },
      { property: "og:title", content: "Holiday Packages — TripWave" },
      { property: "og:description", content: "Curated holiday packages — beach, mountain, heritage, luxury." },
      { property: "og:image", content: hero },
    ],
  }),
  component: HolidaysPage,
});

const packages = [
  { name: "Bali Bliss", days: 6, img: bali, price: 38999, type: "Beach" },
  { name: "Maldives Escape", days: 5, img: maldives, price: 64999, type: "Luxury" },
  { name: "Dubai Highlights", days: 4, img: dubai, price: 42999, type: "City" },
  { name: "Manali Snow", days: 5, img: manali, price: 12499, type: "Mountain" },
  { name: "Goa Beach Break", days: 4, img: goa, price: 8999, type: "Beach" },
  { name: "Royal Jaipur", days: 3, img: jaipur, price: 6499, type: "Heritage" },
];

function HolidaysPage() {
  const create = useCreateBooking();
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [theme, setTheme] = useState("any");
  const [budget, setBudget] = useState([50000]);
  const [notes, setNotes] = useState("");
  const [offers, setOffers] = useState<TravelOption[]>([]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffers(generateTravelOptions("holiday", { destination, start, duration, travelers, theme, budget: budget[0], notes }));
  };

  const selectOffer = (option: TravelOption) => {
    create({
      type: "holiday",
      title: `${option.name} • ${destination || "Holiday package"}`,
      amount: option.price,
      details: { destination, start, duration, travelers, theme, budget: budget[0], notes, package: option.name },
    });
  };

  return (
    <PageShell>
      <PageHero eyebrow="Holidays" title="Hand-crafted holiday packages" subtitle="Tell us your dream — we'll plan the rest." image={hero} />

      <section className="mx-auto -mt-16 max-w-5xl px-4 md:px-6">
        <form onSubmit={onSubmit} className="rounded-3xl bg-card p-6 shadow-elevated ring-1 ring-border md:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Destination</Label>
              <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Bali, Goa, Maldives…" required className="mt-1" />
            </div>
            <Field label="Start date" icon={<Calendar className="h-4 w-4 text-brand-teal" />}>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
            </Field>
            <Field label="Duration (days)">
              <Input type="number" min={1} max={30} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </Field>
            <Field label="Travelers" icon={<Users className="h-4 w-4" />}>
              <Input type="number" min={1} max={20} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} />
            </Field>
            <Field label="Theme">
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="beach">Beach</SelectItem>
                  <SelectItem value="mountain">Mountain</SelectItem>
                  <SelectItem value="city">City break</SelectItem>
                  <SelectItem value="heritage">Heritage</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Wallet className="mr-1 inline h-3.5 w-3.5" /> Total budget: ₹{budget[0].toLocaleString()}
              </Label>
              <Slider min={5000} max={500000} step={5000} value={budget} onValueChange={setBudget} className="mt-3" />
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Special requests</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Vegetarian meals, ocean view rooms, kid-friendly activities…" rows={3} className="mt-1" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" className="gradient-cta border-0 px-8 text-white shadow-cta hover:opacity-95">
              <Search className="mr-2 h-4 w-4" /> Plan my trip
            </Button>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 pb-8 md:px-6">
        <h2 className="font-display text-3xl font-bold">Featured packages</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <div key={p.name} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1">
              <img src={p.img} alt={p.name} loading="lazy" width={800} height={640} className="h-56 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-brand-teal-deep">{p.type}</span>
                  <span className="text-xs text-muted-foreground">{p.days} days</span>
                </div>
                <h3 className="mt-2 font-display text-xl font-bold">{p.name}</h3>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Starting from</div>
                    <div className="font-display text-2xl font-extrabold text-brand-orange-deep">₹{p.price.toLocaleString()}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setDestination(p.name); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    <Palmtree className="mr-1 h-4 w-4" /> Book
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SearchResultsList
        title="Available holiday packages"
        subtitle="Choose your package, then pay to confirm and get your PDF voucher."
        options={offers}
        actionLabel="Select package"
        onSelect={selectOffer}
      />
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
