import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Train, Calendar, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell } from "@/components/PageShell";
import { PageHero } from "@/components/PageHero";
import { SearchResultsList } from "@/components/SearchResultsList";
import { useCreateBooking } from "@/hooks/use-create-booking";
import { generateTravelOptions, type TravelOption } from "@/lib/travel-options";

export const Route = createFileRoute("/trains")({
  head: () => ({
    meta: [
      { title: "Book Train Tickets — TripWave" },
      { name: "description", content: "Search Indian Railways trains, classes, and seat availability." },
      { property: "og:title", content: "Book Train Tickets — TripWave" },
      { property: "og:description", content: "Search Indian Railways trains, classes, and seat availability." },
    ],
  }),
  component: TrainsPage,
});

function TrainsPage() {
  const create = useCreateBooking();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [classType, setClassType] = useState("3a");
  const [quota, setQuota] = useState("general");
  const [passengers, setPassengers] = useState(1);
  const [offers, setOffers] = useState<TravelOption[]>([]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffers(generateTravelOptions("train", { from, to, date, class: classType, quota, passengers }));
  };

  const selectOffer = (option: TravelOption) => {
    create({
      type: "train",
      title: `${option.name} • ${from} to ${to}`,
      amount: option.price,
      details: { from, to, date, class: classType, quota, passengers, train: option.name },
    });
  };

  return (
    <PageShell>
      <PageHero eyebrow="Trains" title="Hop aboard. India by rail." subtitle="Live train status, fares, and one-tap booking across all classes." />

      <section className="mx-auto -mt-8 max-w-4xl px-4 md:px-6">
        <form onSubmit={onSubmit} className="rounded-3xl bg-card p-6 shadow-elevated ring-1 ring-border md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="From station"><Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="New Delhi (NDLS)" required /></Field>
            <Field label="To station"><Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Mumbai CST (CSTM)" required /></Field>
            <Field label="Journey date" icon={<Calendar className="h-4 w-4 text-brand-teal" />}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Passengers" icon={<Users className="h-4 w-4" />}>
              <Input type="number" min={1} max={6} value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} />
            </Field>
            <Field label="Class">
              <Select value={classType} onValueChange={setClassType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1a">AC First (1A)</SelectItem>
                  <SelectItem value="2a">AC 2 Tier (2A)</SelectItem>
                  <SelectItem value="3a">AC 3 Tier (3A)</SelectItem>
                  <SelectItem value="sl">Sleeper (SL)</SelectItem>
                  <SelectItem value="cc">Chair Car (CC)</SelectItem>
                  <SelectItem value="2s">Second Sitting (2S)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Quota">
              <Select value={quota} onValueChange={setQuota}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="tatkal">Tatkal</SelectItem>
                  <SelectItem value="ladies">Ladies</SelectItem>
                  <SelectItem value="senior">Senior Citizen</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" className="gradient-cta border-0 px-8 text-white shadow-cta hover:opacity-95">
              <Search className="mr-2 h-4 w-4" /> Search trains
            </Button>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-4 pb-8 md:px-6">
        <h2 className="font-display text-2xl font-bold">Popular routes</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[["Delhi", "Mumbai"], ["Bengaluru", "Chennai"], ["Kolkata", "Patna"], ["Pune", "Goa"]].map(([a, b]) => (
            <button key={`${a}-${b}`} type="button" onClick={() => { setFrom(a); setTo(b); }} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:bg-secondary/50">
              <div className="flex items-center gap-3">
                <Train className="h-5 w-5 text-brand-teal" />
                <span className="font-semibold">{a} → {b}</span>
              </div>
              <span className="text-sm text-brand-orange-deep">Use route</span>
            </button>
          ))}
        </div>
      </section>

      <SearchResultsList
        title="Available trains"
        subtitle="Select your train option and proceed to payment confirmation."
        options={offers}
        actionLabel="Select train"
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
