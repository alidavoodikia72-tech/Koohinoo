"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z
  .object({
    // چون در DB نداریم، فقط برای نمایش/اعتبارسنجی فرم اختیاری نگه می‌داریم
    name: z.string().optional(),
    email: z
      .string({ required_error: "ایمیل الزامی است." })
      .email("ایمیل معتبر نیست.")
      .toLowerCase(),
    password: z
      .string({ required_error: "رمز عبور الزامی است." })
      .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد.")
      .max(100, "رمز عبور بیش از حد طولانی است."),
    confirmPassword: z
      .string({ required_error: "تکرار رمز عبور الزامی است." })
      .min(6, "تکرار رمز عبور معتبر نیست."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند.",
    path: ["confirmPassword"],
  });

export type RegisterFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "لطفاً خطاهای فرم را اصلاح کنید.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return {
      success: false,
      message: "این ایمیل قبلاً ثبت شده است.",
      fieldErrors: {
        email: ["این ایمیل قبلاً استفاده شده است."],
      },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      // اگر role اجباری است:
      // role: "USER",
    },
  });

  redirect("/login?registered=1");
}
