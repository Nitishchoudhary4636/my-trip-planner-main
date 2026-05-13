import { Clock3, Star, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TravelOption } from "@/lib/travel-options";

type Props = {
  title: string;
  subtitle: string;
  options: TravelOption[];
  actionLabel: string;
  onSelect: (option: TravelOption) => void;
};

export function SearchResultsList({ title, subtitle, options, actionLabel, onSelect }: Props) {
  if (options.length === 0) return null;

  return (
    <section className="mx-auto mt-8 max-w-5xl px-4 pb-8 md:px-6">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft md:p-6">
        <h2 className="font-display text-2xl font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

        <div className="mt-5 grid gap-3">
          {options.map((option) => (
            <div key={option.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{option.name}</h3>
                  <p className="text-sm text-muted-foreground">{option.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {option.departureTime && option.arrivalTime && (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" /> {option.departureTime} - {option.arrivalTime}
                      </span>
                    )}
                    {option.duration && <span>{option.duration}</span>}
                    <span>{option.seatsLeft} left</span>
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {option.rating}</span>
                    <span>{option.refundable ? "Free cancellation" : "Partial cancellation"}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Final fare</p>
                  <p className="font-display text-2xl font-extrabold text-brand-orange-deep">INR {option.price.toLocaleString("en-IN")}</p>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2 gradient-cta border-0 text-white shadow-cta hover:opacity-95"
                    onClick={() => onSelect(option)}
                  >
                    <Ticket className="mr-1.5 h-4 w-4" /> {actionLabel}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
