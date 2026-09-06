"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TripStatus } from "@prisma/client";

export type TripActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

const tripSchema = z
  .object({
    title: z.string().trim().min(3, "عنوان باید حداقل ۳ کاراکتر باشد"),
    description: z.string().optional(),
    startDate: z.coerce.date({ invalid_type_error: "تاریخ شروع نامعتبر است" }),
    endDate: z.coerce.date().optional().nullable(),
    location: z.string().trim().min(2, "موقعیت باید حداقل ۲ کاراکتر باشد"),
    difficulty: z.string().trim().min(1, "درجه سختی الزامی است"),
    price: z.coerce.number().int().min(0, "قیمت نمی‌تواند منفی باشد").default(0),
    capacity: z.coerce
      .number()
      .int()
      .min(1, "ظرفیت باید حداقل ۱ باشد")
      .default(20),
    status: z.nativeEnum(TripStatus).default(TripStatus.DRAFT),
    clubId: z.string().trim().min(1, "باشگاه الزامی است"),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد",
  });

function normalizeText(v: FormDataEntryValue | null | undefined) {
  return typeof v === "string" ? v.trim() : "";
}

function formToInput(formData: FormData) {
  const rawPrice = formData.get("price");
  const rawCapacity = formData.get("capacity");

  return {
    title: normalizeText(formData.get("title")),
    description: normalizeText(formData.get("description")),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || null,
    location: normalizeText(formData.get("location")),
    difficulty: normalizeText(formData.get("difficulty")),
    price: rawPrice === "" || rawPrice == null ? 0 : rawPrice,
    capacity: rawCapacity === "" || rawCapacity == null ? 20 : rawCapacity,
    status: (formData.get("status") as TripStatus | null) ?? TripStatus.DRAFT,
    clubId: normalizeText(formData.get("clubId")),
  };
}

async function getUserClubIdsFromSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null as string | null, clubIds: [] as string[] };
  }

  const clubId =
    typeof session.user.clubId === "string" ? session.user.clubId : null;

  return {
    userId: session.user.id,
    clubIds: clubId ? [clubId] : [],
  };
}

export async function createTrip(
  _prevState: TripActionState,
  formData: FormData
): Promise<TripActionState> {
  const { userId, clubIds: allowedClubIds } = await getUserClubIdsFromSession();

  if (!userId) {
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = tripSchema.safeParse(formToInput(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "اطلاعات فرم نامعتبر است",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!allowedClubIds.includes(parsed.data.clubId)) {
    return {
      ok: false,
      message: "شما اجازه ثبت برنامه برای این باشگاه را ندارید",
      fieldErrors: { clubId: ["باشگاه انتخاب‌شده متعلق به شما نیست"] },
    };
  }

  try {
    await prisma.trip.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description?.trim() || null,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate ?? null,
        location: parsed.data.location,
        difficulty: parsed.data.difficulty,
        price: parsed.data.price,
        capacity: parsed.data.capacity,
        status: parsed.data.status,
        clubId: parsed.data.clubId,
        createdById: userId,
      },
    });

    revalidatePath("/dashboard/trips");
    return { ok: true, message: "برنامه با موفقیت ایجاد شد" };
  } catch (error) {
    console.error("createTrip error:", error);
    return { ok: false, message: "خطا در ایجاد برنامه" };
  }
}

export async function updateTrip(
  tripId: string,
  _prevState: TripActionState,
  formData: FormData
): Promise<TripActionState> {
  const { userId, clubIds: allowedClubIds } = await getUserClubIdsFromSession();

  if (!userId) {
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = tripSchema.safeParse(formToInput(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "اطلاعات فرم نامعتبر است",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!allowedClubIds.includes(parsed.data.clubId)) {
    return {
      ok: false,
      message: "شما اجازه ویرایش برای این باشگاه را ندارید",
      fieldErrors: { clubId: ["باشگاه انتخاب‌شده متعلق به شما نیست"] },
    };
  }

  const existing = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, clubId: true },
  });

  if (!existing) {
    return { ok: false, message: "برنامه موردنظر پیدا نشد" };
  }

  if (!allowedClubIds.includes(existing.clubId)) {
    return { ok: false, message: "شما اجازه ویرایش این برنامه را ندارید" };
  }

  try {
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description?.trim() || null,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate ?? null,
        location: parsed.data.location,
        difficulty: parsed.data.difficulty,
        price: parsed.data.price,
        capacity: parsed.data.capacity,
        status: parsed.data.status,
        clubId: parsed.data.clubId,
      },
    });

    revalidatePath("/dashboard/trips");
    revalidatePath(`/dashboard/trips/${tripId}`);
    revalidatePath(`/dashboard/trips/${tripId}/edit`);

    return { ok: true, message: "برنامه با موفقیت بروزرسانی شد" };
  } catch (error) {
    console.error("updateTrip error:", error);
    return { ok: false, message: "خطا در بروزرسانی برنامه" };
  }
}

export async function deleteTrip(tripId: string): Promise<TripActionState> {
  const { userId, clubIds: allowedClubIds } = await getUserClubIdsFromSession();

  if (!userId) {
    return { ok: false, message: "Unauthorized" };
  }

  const existing = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, clubId: true },
  });

  if (!existing) {
    return { ok: false, message: "برنامه موردنظر پیدا نشد" };
  }

  if (!allowedClubIds.includes(existing.clubId)) {
    return { ok: false, message: "شما اجازه حذف این برنامه را ندارید" };
  }

  try {
    await prisma.trip.delete({
      where: { id: tripId },
    });

    revalidatePath("/dashboard/trips");
    return { ok: true, message: "برنامه با موفقیت حذف شد" };
  } catch (error) {
    console.error("deleteTrip error:", error);
    return { ok: false, message: "خطا در حذف برنامه" };
  }
}
