"use server";

import { z } from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const LoginSchema = z.object({
  email: z
    .string({ required_error: "ایمیل الزامی است." })
    .email("ایمیل معتبر نیست.")
    .toLowerCase(),
  password: z
    .string({ required_error: "رمز عبور الزامی است." })
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
});

export type LoginFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "لطفاً خطاهای فرم را اصلاح کنید.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "ایمیل یا رمز عبور نادرست است.",
          };
        default:
          return {
            success: false,
            message: "خطایی در ورود رخ داد.",
          };
      }
    }

    throw error;
  }
}
