"use server";

import { trips } from "@/data/trips";
import {
  addRegistration,
  getRegistrationsByTripSlug,
} from "@/lib/registrations-store";
import { tripRegistrationSchema } from "@/lib/validators/trip-registration";

type SubmitRegistrationResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function submitRegistration(
  tripSlug: string,
  formData: FormData
): Promise<SubmitRegistrationResult> {
  const trip = trips.find((item) => item.slug === tripSlug);

  if (!trip) {
    return {
      success: false,
      message: "برنامه موردنظر پیدا نشد.",
    };
  }

  const rawData = {
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    nationalId: String(formData.get("nationalId") ?? "").trim(),
    emergencyPhone: String(formData.get("emergencyPhone") ?? "").trim(),
    medicalNotes: String(formData.get("medicalNotes") ?? "").trim(),
  };

  const parsed = tripRegistrationSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: "اطلاعات فرم نامعتبر است.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const registrations = await getRegistrationsByTripSlug(tripSlug);

  if (registrations.length >= trip.capacity) {
    return {
      success: false,
      message: "ظرفیت این برنامه تکمیل شده است.",
    };
  }

  const duplicate = registrations.find(
    (item) =>
      item.nationalId === parsed.data.nationalId ||
      item.phone === parsed.data.phone
  );

  if (duplicate) {
    return {
      success: false,
      message: "شما قبلاً برای این برنامه ثبت‌نام کرده‌اید.",
    };
  }

  await addRegistration({
    tripSlug,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    nationalId: parsed.data.nationalId,
    emergencyPhone: parsed.data.emergencyPhone || undefined,
    medicalNotes: parsed.data.medicalNotes || undefined,
  });

  return {
    success: true,
    message: "ثبت‌نام شما با موفقیت انجام شد.",
  };
}
