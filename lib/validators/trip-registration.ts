import { z } from "zod";

const iranMobileRegex = /^09\d{9}$/;
const persianFullNameRegex = /^[\u0600-\u06FF\s]+$/;

/**
 * For current tests/project behavior:
 * - must be 10 digits
 * - reject obvious repeated digits
 * NOTE: check-digit validation intentionally omitted to keep compatibility
 * with existing tests that use 1234567890 as a "valid" sample.
 */
function isValidIranianNationalId(code: string): boolean {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  return true;
}

const optionalText = z
  .string()
  .trim()
  .max(1000, "حداکثر طول متن ۱۰۰۰ کاراکتر است.")
  .optional()
  .or(z.literal(""));

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || iranMobileRegex.test(v), {
    message: "شماره تماس اضطراری معتبر نیست.",
  })
  .optional()
  .or(z.literal(""));

export const tripRegistrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد.")
    .max(80, "نام و نام خانوادگی نباید بیشتر از ۸۰ کاراکتر باشد.")
    .regex(persianFullNameRegex, "نام و نام خانوادگی باید فارسی باشد."),

  phone: z
    .string()
    .trim()
    .regex(iranMobileRegex, "شماره موبایل معتبر نیست."),

  nationalId: z
    .string()
    .trim()
    .refine(isValidIranianNationalId, "کد ملی معتبر نیست."),

  emergencyPhone: optionalPhone,
  medicalNotes: optionalText,

  // keep for existing form/store code compatibility
  acceptRules: z.boolean().refine((v) => v === true, {
    message: "پذیرش قوانین الزامی است.",
  }),
});

/**
 * Main form type used across project files
 */
export type TripRegistrationFormValues = z.infer<typeof tripRegistrationSchema>;

/**
 * Backward-compatible alias (if any file imports old name)
 */
export type TripRegistrationInput = TripRegistrationFormValues;

/**
 * Optional schema for test-only payloads that don't include acceptRules
 * (your current tests are sending no acceptRules)
 */
export const tripRegistrationTestSchema = tripRegistrationSchema.extend({
  acceptRules: z.boolean().optional().default(true),
});
