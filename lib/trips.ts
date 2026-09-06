import { trips, type TripStatus } from "@/data/trips";
import { getTripRegisteredCount } from "@/lib/trip-registrations-store";

export function getStatusLabel(status: TripStatus) {
  switch (status) {
    case "open":
      return "باز";
    case "full":
      return "تکمیل ظرفیت";
    case "closed":
      return "بسته";
    default:
      return "-";
  }
}

export function getStatusClass(status: TripStatus) {
  switch (status) {
    case "open":
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30";
    case "full":
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30";
    case "closed":
      return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30";
    default:
      return "bg-slate-500/15 text-slate-300 ring-1 ring-white/10";
  }
}

export function getTripBySlug(slug: string) {
  return trips.find((trip) => trip.slug === slug);
}

export function getEffectiveRegisteredCount(slug: string) {
  return getTripRegisteredCount(slug);
}
