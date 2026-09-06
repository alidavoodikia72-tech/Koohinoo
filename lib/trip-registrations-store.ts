import { trips } from "@/data/trips"; // ایمپورت ضروری برای پیدا کردن ظرفیت
import { TripRegistrationFormValues } from "./validators/trip-registration";

export interface TripRegistration extends TripRegistrationFormValues {
  id: string;
  tripSlug: string;
  createdAt: string;
}

let registrations: TripRegistration[] = [];

export const getTripRegistrations = (tripSlug: string) => {
  return registrations.filter((r) => r.tripSlug === tripSlug);
};

export const addTripRegistration = (
  tripSlug: string,
  data: TripRegistrationFormValues
) => {
  const newRegistration: TripRegistration = {
    ...data,
    id: crypto.randomUUID(), // استفاده از متد استاندارد
    tripSlug,
    createdAt: new Date().toISOString(),
  };
  registrations.push(newRegistration);
  return newRegistration;
};

export const findTripRegistrationByNationalId = (
  tripSlug: string,
  nationalId: string
) => {
  return registrations.find(
    (r) => r.tripSlug === tripSlug && r.nationalId === nationalId
  );
};

export const getTripRegisteredCount = (tripSlug: string) => {
  return getTripRegistrations(tripSlug).length;
};

// تابع اصلاح شده: دیگر آرگومان capacity نمی‌خواهد
export const getTripRemainingCapacity = (tripSlug: string) => {
  const trip = trips.find((t) => t.slug === tripSlug);
  if (!trip) return 0;
  return Math.max(0, trip.capacity - getTripRegisteredCount(tripSlug));
};

export const isTripRegistrationClosed = (tripSlug: string) => {
  const trip = trips.find((t) => t.slug === tripSlug);
  if (!trip) return true;
  return getTripRegisteredCount(tripSlug) >= trip.capacity;
};
