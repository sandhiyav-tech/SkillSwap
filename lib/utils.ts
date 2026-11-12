import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeSlot(slot: string): string {
  // e.g. "09:00-11:00" -> "9:00 AM - 11:00 AM"
  const [start, end] = slot.split("-");
  if (!start || !end) return slot;

  const to12Hr = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  return `${to12Hr(start)} - ${to12Hr(end)}`;
}

export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (!reviews || reviews.length === 0) return 5.0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
}
