import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Car, MapPin, Calendar, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { SearchResultsList } from "@/components/SearchResultsList";
import { useCreateBooking } from "@/hooks/use-create-booking";
import { generateTravelOptions, type TravelOption } from "@/lib/travel-options";

export const Route = createFileRoute("/cabs")({
  head: () => ({
    meta: [
      { title: "Book Cabs & Outstation Taxis — TripWave" },
      { name: "description", content: "Outstation, airport transfer, hourly rentals — book a cab in seconds." },
      { property: "og:title", content: "Book Cabs & Outstation Taxis — TripWave" },
      { property: "og:description", content: "Outstation, airport transfer, hourly rentals — book a cab in seconds." },
    ],
  }),
  component: CabsPage,
});

function CabsPage() {
  const create = useCreateBooking();
  const [tripType, setTripType] = useState("oneway");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [carType, setCarType] = useState("sedan");
  const [hours, setHours] = useState(4);
  const [offers, setOffers] = useState<TravelOption[]>([]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffers(generateTravelOptions("cab", { tripType, pickup, drop, date, time, carType, hours }));
  };

  const selectOffer = (option: TravelOption) => {
    create({
      type: "cab",
      title: `${option.name} • ${pickup} to ${drop || tripType}`,
      amount: option.price,
      details: { tripType, pickup, drop, date, time, carType, hours, cabProvider: option.provider },
    });
  };

  return (
    <PageShell>
      <PageHero eyebrow="Cabs" title="Book a ride for any plan" subtitle="Outstation getaways, airport transfers, or rent by the hour." />

      <section className="mx-auto -mt-8 max-w-4xl px-4 md:px-6">
        <form onSubmit={onSubmit} className="rounded-3xl bg-card p-6 shadow-elevated ring-1 ring-border md:p-8">
          <RadioGroup value={tripType} onValueChange={setTripType} className="mb-6 flex flex-wrap gap-4">
            {[["oneway", "One way"], ["roundtrip", "Round trip"], ["airport", "Airport transfer"], ["rental", "Hourly rental"]].map(([v, l]) => (
              <Label key={v} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <RadioGroupItem value={v} /> {l}
              </Label>
            ))}
          </RadioGroup>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Pickup location" icon={<MapPin className="h-4 w-4 text-brand-teal" />}>
              <Input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Bengaluru Airport" required />
            </Field>
            {tripType !== "rental" && (
              <Field label="Drop location" icon={<MapPin className="h-4 w-4 text-brand-orange" />}>
                <Input value={drop} onChange={(e) => setDrop(e.target.value)} placeholder="MG Road" required />
              </Field>
            )}
            <Field label="Date" icon={<Calendar className="h-4 w-4 text-brand-teal" />}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Pickup time" icon={<Clock className="h-4 w-4" />}>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </Field>
            {tripType === "rental" && (
              <Field label="Hours">
                <Select value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2, 4, 6, 8, 10, 12].map((h) => <SelectItem key={h} value={String(h)}>{h} hours</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field label="Car type">
              <Select value={carType} onValueChange={setCarType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hatchback">Hatchback</SelectItem>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="tempo">Tempo Traveller</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" className="gradient-cta border-0 px-8 text-white shadow-cta hover:opacity-95">
              <Search className="mr-2 h-4 w-4" /> Search cabs
            </Button>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-4 pb-8 md:px-6">
        <h2 className="font-display text-2xl font-bold">Popular cab services</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[
            { t: "Airport pickup", p: "₹599" },
            { t: "Outstation 1-day", p: "₹2,499" },
            { t: "Hourly 4hrs", p: "₹999" },
            { t: "Wedding luxury", p: "₹4,999" },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <Car className="h-5 w-5 text-brand-teal" />
              <div className="mt-2 text-sm font-semibold">{s.t}</div>
              <div className="text-xs text-muted-foreground">from <b>{s.p}</b></div>
            </div>
          ))}
        </div>
      </section>

      <SearchResultsList
        title="Available cab options"
        subtitle="Choose one cab option and continue to secure payment."
        options={offers}
        actionLabel="Select cab"
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
