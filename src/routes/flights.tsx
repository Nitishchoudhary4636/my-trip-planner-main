import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plane, ArrowLeftRight, Calendar, Users, Search } from "lucide-react";
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
import hero from "@/assets/dest-maldives.jpg";

export const Route = createFileRoute("/flights")({
  head: () => ({
    meta: [
      { title: "Book Flights — TripWave" },
      { name: "description", content: "Search and compare cheap flights across airlines worldwide." },
      { property: "og:title", content: "Book Flights — TripWave" },
      { property: "og:description", content: "Search and compare cheap flights across airlines worldwide." },
      { property: "og:image", content: hero },
    ],
  }),
  component: FlightsPage,
});

function FlightsPage() {
  const create = useCreateBooking();
  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [classType, setClassType] = useState("economy");
  const [airline, setAirline] = useState("any");
  const [offers, setOffers] = useState<TravelOption[]>([]);

  const swap = () => { setFrom(to); setTo(from); };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffers(generateTravelOptions("flight", { tripType, from, to, departure, returnDate, adults, children, class: classType, airline }));
  };

  const selectOffer = (option: TravelOption) => {
    create({
      type: "flight",
      title: `${option.name} • ${from || "Origin"} to ${to || "Destination"}`,
      amount: option.price,
      details: {
        tripType,
        from,
        to,
        departure,
        returnDate,
        adults,
        children,
        class: classType,
        airline,
        flight: option.name,
        departureTime: option.departureTime || "",
        arrivalTime: option.arrivalTime || "",
      },
    });
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Flights"
        title="Find the perfect flight"
        subtitle="Compare fares across hundreds of airlines and book with confidence."
        image={hero}
      />

      <section className="mx-auto -mt-16 max-w-5xl px-4 md:px-6">
        <form onSubmit={onSubmit} className="rounded-3xl bg-card p-6 shadow-elevated ring-1 ring-border md:p-8">
          <RadioGroup value={tripType} onValueChange={setTripType} className="mb-6 flex flex-wrap gap-4">
            {[["oneway", "One way"], ["roundtrip", "Round trip"], ["multicity", "Multi-city"]].map(([v, l]) => (
              <Label key={v} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <RadioGroupItem value={v} /> {l}
              </Label>
            ))}
          </RadioGroup>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 md:col-span-2">
              <Field label="From">
                <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Delhi (DEL)" required />
              </Field>
              <Button type="button" variant="outline" size="icon" onClick={swap} className="mb-0.5 rounded-full" aria-label="Swap">
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
              <Field label="To">
                <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Mumbai (BOM)" required />
              </Field>
            </div>
            <Field label="Departure" icon={<Calendar className="h-4 w-4 text-brand-teal" />}>
              <Input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} required />
            </Field>
            <Field label="Return" icon={<Calendar className="h-4 w-4 text-brand-orange" />}>
              <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} disabled={tripType === "oneway"} />
            </Field>
            <Field label="Adults" icon={<Users className="h-4 w-4" />}>
              <Input type="number" min={1} max={9} value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
            </Field>
            <Field label="Children">
              <Input type="number" min={0} max={9} value={children} onChange={(e) => setChildren(Number(e.target.value))} />
            </Field>
            <Field label="Class">
              <Select value={classType} onValueChange={setClassType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Preferred airline">
              <Select value={airline} onValueChange={setAirline}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="indigo">IndiGo</SelectItem>
                  <SelectItem value="airindia">Air India</SelectItem>
                  <SelectItem value="vistara">Vistara</SelectItem>
                  <SelectItem value="emirates">Emirates</SelectItem>
                  <SelectItem value="qatar">Qatar Airways</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" className="gradient-cta border-0 px-8 text-white shadow-cta hover:opacity-95">
              <Search className="mr-2 h-4 w-4" /> Search flights
            </Button>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-4 pb-8 md:px-6">
        <h2 className="font-display text-2xl font-bold">Why book flights with us</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { icon: Plane, title: "500+ airlines", desc: "Compare every major carrier in one search." },
            { icon: Calendar, title: "Flexible dates", desc: "Find cheaper days around your trip." },
            { icon: Users, title: "Group fares", desc: "Save when booking 4+ travelers together." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <f.icon className="h-5 w-5 text-brand-teal" />
              <div className="mt-3 font-semibold">{f.title}</div>
              <div className="text-sm text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <SearchResultsList
        title="Available flights"
        subtitle="Select one flight to continue to payment and instant ticket confirmation."
        options={offers}
        actionLabel="Select and pay"
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
