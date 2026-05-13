import type { Booking } from "@/lib/auth";

export type TravelOption = {
  id: string;
  name: string;
  provider: string;
  summary: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  seatsLeft: number;
  rating: number;
  price: number;
  refundable: boolean;
};

function seedFrom(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function timeLabel(h: number, m: number): string {
  const hh = String(h % 24).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function generateTravelOptions(type: Booking["type"], query: Record<string, string | number>): TravelOption[] {
  const seed = seedFrom(`${type}:${JSON.stringify(query)}`);
  const random = rng(seed);

  const providers: Record<Booking["type"], string[]> = {
    flight: ["IndiGo", "Air India", "Akasa Air", "Vistara", "SpiceJet"],
    hotel: ["Treebo", "FabHotels", "Lemon Tree", "IHG", "Marriott"],
    holiday: ["TripWave Premium", "GlobeTrail", "Sunset Holidays", "BlueSky Tours", "Nomad Collective"],
    train: ["Rajdhani Express", "Duronto", "Shatabdi", "Vande Bharat", "Garib Rath"],
    bus: ["VRL Travels", "SRS Tours", "Orange Travels", "RedBus Partner", "KSRTC"],
    cab: ["TripWave Cabs", "Prime Sedan", "Rapid Cabs", "ComfortRide", "CityGo"],
  };

  const baseFare: Record<Booking["type"], number> = {
    flight: 4200,
    hotel: 3200,
    holiday: 18500,
    train: 780,
    bus: 650,
    cab: 980,
  };

  const list = Array.from({ length: 5 }).map((_, idx) => {
    const provider = providers[type][idx % providers[type].length];
    const fareVariance = 0.78 + random() * 0.9;
    const surge = 1 + idx * 0.06;
    const price = Math.round(baseFare[type] * fareVariance * surge);
    const startHour = 5 + Math.floor(random() * 14);
    const startMinute = [0, 10, 20, 30, 40, 50][Math.floor(random() * 6)];
    const durationHours = 1 + Math.floor(random() * 7);
    const endHour = startHour + durationHours;
    const duration = `${durationHours}h ${Math.floor(random() * 50) + 10}m`;

    let name = `${provider}`;
    let summary = "Best value";

    if (type === "flight") {
      name = `${provider} ${Math.floor(100 + random() * 900)}`;
      summary = `${query.from || "Origin"} to ${query.to || "Destination"} • ${query.class || "Economy"}`;
    }
    if (type === "hotel") {
      name = `${provider} ${["Residency", "Suites", "Inn", "Grand", "Retreat"][idx % 5]}`;
      summary = `${query.city || "City"} • ${query.stars || "Any"} star • Breakfast`;
    }
    if (type === "holiday") {
      name = `${provider} Package ${idx + 1}`;
      summary = `${query.destination || "Destination"} • ${query.duration || 5} days`;
    }
    if (type === "train") {
      name = `${provider} (${12000 + Math.floor(random() * 7000)})`;
      summary = `${query.from || "Source"} to ${query.to || "Destination"} • ${query.class || "3A"}`;
    }
    if (type === "bus") {
      name = `${provider} ${["AC Sleeper", "Seater", "Volvo", "Semi Sleeper"][idx % 4]}`;
      summary = `${query.from || "Source"} to ${query.to || "Destination"}`;
    }
    if (type === "cab") {
      name = `${provider} ${["Sedan", "SUV", "Prime", "XL", "Eco"][idx % 5]}`;
      summary = `${query.pickup || "Pickup"} to ${query.drop || query.tripType || "Route"}`;
    }

    return {
      id: `${type}-${idx + 1}`,
      name,
      provider,
      summary,
      departureTime: type === "hotel" || type === "holiday" ? undefined : timeLabel(startHour, startMinute),
      arrivalTime: type === "hotel" || type === "holiday" ? undefined : timeLabel(endHour, startMinute),
      duration: type === "hotel" || type === "holiday" ? undefined : duration,
      seatsLeft: Math.max(2, Math.floor(random() * 26)),
      rating: Number((4 + random() * 0.9).toFixed(1)),
      price,
      refundable: random() > 0.35,
    } satisfies TravelOption;
  });

  return list.sort((a, b) => a.price - b.price);
}
