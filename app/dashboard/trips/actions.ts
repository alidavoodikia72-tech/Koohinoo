"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/auth";
import { TripStatus } from "@prisma/client";

// تعریف Schema برای اعتبارسنجی ورودی‌ها
const TripSchema = z.object({
  title: z.string().min(3, "عنوان باید حداقل ۳ کاراکتر باشد"),
  description: z.string().optional(),
  startDate: z.coerce.date({ required_error: "تاریخ شروع الزامی است" }),
  endDate: z.coerce.date().optional().nullable(),
  location: z.string().min(2, "مکان صعود الزامی است"),
  difficulty: z.string(),
  price: z.coerce.number().int().min(0).default(0), // تبدیل اتوماتیک رشته به عدد و جلوگیری از null
  capacity: z.coerce.number().int().min(1).default(20),
  status: z.nativeEnum(TripStatus).default(TripStatus.DRAFT),
  clubId: z.string().min(1, "انتخاب باشگاه الزامی است"),
});

export async function createTrip(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("باید وارد حساب خود شوید");

  const rawData = Object.fromEntries(formData.entries());
  const validated = TripSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "داده‌های فرم نامعتبر هستند", details: validated.error.flatten() };
  }

  try {
    await prisma.trip.create({
      data: {
        ...validated.data,
        description: validated.data.description || null,
        endDate: validated.data.endDate || null,
        createdById: session.user.id,
      },
    });
  } catch (error) {
    console.error("Create Trip Error:", error);
    return { error: "خطا در ثبت برنامه در دیتابیس" };
  }

  revalidatePath("/dashboard/trips");
  redirect("/dashboard/trips");
}

export async function updateTrip(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("عدم دسترسی");

  const rawData = Object.fromEntries(formData.entries());
  const validated = TripSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "داده‌ها نامعتبر هستند" };
  }

  try {
    await prisma.trip.update({
      where: { id },
      data: {
        ...validated.data,
        description: validated.data.description || null,
        endDate: validated.data.endDate || null,
      },
    });
  } catch (error) {
    console.error("Update Trip Error:", error);
    return { error: "خطا در بروزرسانی برنامه" };
  }

  revalidatePath("/dashboard/trips");
  revalidatePath(`/dashboard/trips/${id}`);
  redirect("/dashboard/trips");
}

export async function deleteTrip(id: string) {
  try {
    await prisma.trip.delete({ where: { id } });
    revalidatePath("/dashboard/trips");
    return { success: true };
  } catch (error) {
    return { error: "خطا در حذف برنامه" };
  }
}
