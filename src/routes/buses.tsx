import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bus, Calendar, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { SearchResultsList } from "@/components/SearchResultsList";
import { useCreateBooking } from "@/hooks/use-create-booking";
import { generateTravelOptions, type TravelOption } from "@/lib/travel-options";

export const Route = createFileRoute("/buses")({
  head: () => ({
    meta: [
      { title: "Book Bus Tickets — TripWave" },
      { name: "description", content: "AC, sleeper, Volvo and more — book intercity bus tickets fast." },
      { property: "og:title", content: "Book Bus Tickets — TripWave" },
      { property: "og:description", content: "AC, sleeper, Volvo and more — book intercity bus tickets fast." },
    ],
  }),
  component: BusesPage,
});

function BusesPage() {
  const create = useCreateBooking();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [busType, setBusType] = useState("any");
  const [seats, setSeats] = useState(1);
  const [filters, setFilters] = useState<string[]>([]);
  const [offers, setOffers] = useState<TravelOption[]>([]);

  const toggle = (f: string) => setFilters((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffers(generateTravelOptions("bus", { from, to, date, busType, seats, filters: filters.join(", ") }));
  };

  const selectOffer = (option: TravelOption) => {
    create({
      type: "bus",
      title: `${option.name} • ${from} to ${to}`,
      amount: option.price,
      details: { from, to, date, busType, seats, filters: filters.join(", "), operator: option.provider },
    });
  };

  return (
    <PageShell>
      <PageHero eyebrow="Buses" title="Comfortable buses, simple booking" subtitle="Pick your seat, choose your operator, travel happy." />

      <section className="mx-auto -mt-8 max-w-4xl px-4 md:px-6">
        <form onSubmit={onSubmit} className="rounded-3xl bg-card p-6 shadow-elevated ring-1 ring-border md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="From"><Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Bengaluru" required /></Field>
            <Field label="To"><Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Hyderabad" required /></Field>
            <Field label="Date" icon={<Calendar className="h-4 w-4 text-brand-teal" />}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Seats" icon={<Users className="h-4 w-4" />}>
              <Input type="number" min={1} max={10} value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
            </Field>
            <Field label="Bus type">
              <Select value={busType} onValueChange={setBusType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="ac-sleeper">AC Sleeper</SelectItem>
                  <SelectItem value="non-ac-sleeper">Non-AC Sleeper</SelectItem>
                  <SelectItem value="ac-seater">AC Seater</SelectItem>
                  <SelectItem value="volvo">Volvo Multi-Axle</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-6">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferences</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {["Live tracking", "Charging point", "Reading light", "Blanket", "Water bottle"].map((f) => (
                <label key={f} className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-sm">
                  <Checkbox checked={filters.includes(f)} onCheckedChange={() => toggle(f)} /> {f}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" className="gradient-cta border-0 px-8 text-white shadow-cta hover:opacity-95">
              <Search className="mr-2 h-4 w-4" /> Search buses
            </Button>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-4 pb-8 md:px-6">
        <h2 className="font-display text-2xl font-bold">Top operators</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {["RedExpress", "VRL Travels", "SRS Tours", "Orange Tours"].map((o) => (
            <div key={o} className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
              <Bus className="mx-auto h-5 w-5 text-brand-teal" />
              <div className="mt-2 text-sm font-semibold">{o}</div>
            </div>
          ))}
        </div>
      </section>

      <SearchResultsList
        title="Available buses"
        subtitle="Pick your bus operator and seat fare, then pay to confirm instantly."
        options={offers}
        actionLabel="Select bus"
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
