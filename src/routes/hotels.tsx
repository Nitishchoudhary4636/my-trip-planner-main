import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hotel, Calendar, MapPin, Users, Search, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { SearchResultsList } from "@/components/SearchResultsList";
import { useCreateBooking } from "@/hooks/use-create-booking";
import { generateTravelOptions, type TravelOption } from "@/lib/travel-options";
import hero from "@/assets/dest-bali.jpg";

export const Route = createFileRoute("/hotels")({
  head: () => ({
    meta: [
      { title: "Book Hotels — TripWave" },
      { name: "description", content: "Discover and book hotels, resorts and homestays worldwide." },
      { property: "og:title", content: "Book Hotels — TripWave" },
      { property: "og:description", content: "Discover and book hotels, resorts and homestays worldwide." },
      { property: "og:image", content: hero },
    ],
  }),
  component: HotelsPage,
});

const amenities = ["Wi-Fi", "Pool", "Breakfast", "Parking", "Pet friendly", "Gym"];

function HotelsPage() {
  const create = useCreateBooking();
  const [city, setCity] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [stars, setStars] = useState("any");
  const [budget, setBudget] = useState([5000]);
  const [picked, setPicked] = useState<string[]>([]);
  const [offers, setOffers] = useState<TravelOption[]>([]);

  const toggle = (a: string) =>
    setPicked((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffers(generateTravelOptions("hotel", { city, checkin, checkout, rooms, guests, stars, maxBudget: budget[0], amenities: picked.join(", ") }));
  };

  const selectOffer = (option: TravelOption) => {
    create({
      type: "hotel",
      title: `${option.name} • ${city || "Hotel stay"}`,
      amount: option.price,
      details: {
        city,
        checkin,
        checkout,
        rooms,
        guests,
        stars,
        maxBudget: budget[0],
        amenities: picked.join(", "),
        property: option.name,
      },
    });
  };

  return (
    <PageShell>
      <PageHero eyebrow="Hotels" title="Stay where the story begins" subtitle="From cozy homestays to luxe resorts — over 1.5M places worldwide." image={hero} />

      <section className="mx-auto -mt-16 max-w-5xl px-4 md:px-6">
        <form onSubmit={onSubmit} className="rounded-3xl bg-card p-6 shadow-elevated ring-1 ring-border md:p-8">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">City / Hotel</Label>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-input bg-background px-3">
                <MapPin className="h-4 w-4 text-brand-teal" />
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Goa, India" required className="border-0 shadow-none focus-visible:ring-0" />
              </div>
            </div>
            <Field label="Check-in" icon={<Calendar className="h-4 w-4 text-brand-teal" />}>
              <Input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} required />
            </Field>
            <Field label="Check-out" icon={<Calendar className="h-4 w-4 text-brand-orange" />}>
              <Input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} required />
            </Field>
            <Field label="Rooms" icon={<BedDouble className="h-4 w-4" />}>
              <Input type="number" min={1} max={9} value={rooms} onChange={(e) => setRooms(Number(e.target.value))} />
            </Field>
            <Field label="Guests" icon={<Users className="h-4 w-4" />}>
              <Input type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
            </Field>
            <Field label="Star rating">
              <Select value={stars} onValueChange={setStars}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="3">3★ & up</SelectItem>
                  <SelectItem value="4">4★ & up</SelectItem>
                  <SelectItem value="5">5★ only</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="md:col-span-1">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Max budget per night: ₹{budget[0].toLocaleString()}
              </Label>
              <Slider min={1000} max={50000} step={500} value={budget} onValueChange={setBudget} className="mt-3" />
            </div>
          </div>

          <div className="mt-6">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amenities</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {amenities.map((a) => (
                <label key={a} className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-sm">
                  <Checkbox checked={picked.includes(a)} onCheckedChange={() => toggle(a)} />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" className="gradient-cta border-0 px-8 text-white shadow-cta hover:opacity-95">
              <Search className="mr-2 h-4 w-4" /> Search hotels
            </Button>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-4 pb-8 md:px-6">
        <h2 className="font-display text-2xl font-bold">Top picks this week</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { name: "Seaside Villa, Goa", price: "₹4,200", rating: 4.7 },
            { name: "Mountain Lodge, Manali", price: "₹3,100", rating: 4.6 },
            { name: "Heritage Haveli, Jaipur", price: "₹5,800", rating: 4.8 },
          ].map((h) => (
            <div key={h.name} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <Hotel className="h-5 w-5 text-brand-teal" />
              <div className="mt-3 font-semibold">{h.name}</div>
              <div className="text-sm text-muted-foreground">★ {h.rating} • from <b>{h.price}</b>/night</div>
            </div>
          ))}
        </div>
      </section>

      <SearchResultsList
        title="Available hotels"
        subtitle="Choose your preferred stay and continue to payment checkout."
        options={offers}
        actionLabel="Book this hotel"
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
