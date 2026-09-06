import { describe, expect, it } from "vitest";
import { tripRegistrationTestSchema as tripRegistrationSchema } from "@/lib/validators/trip-registration";

describe("tripRegistrationSchema", () => {
  it("accepts valid registration data", () => {
    const result = tripRegistrationSchema.safeParse({
      fullName: "علی داوودی کیا",
      phone: "09123456789",
      nationalId: "1234567890",
      emergencyPhone: "09912345678",
      medicalNotes: "بدون مشکل خاص",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid phone", () => {
    const result = tripRegistrationSchema.safeParse({
      fullName: "علی داوودی کیا",
      phone: "9123456789",
      nationalId: "1234567890",
      emergencyPhone: "",
      medicalNotes: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid nationalId", () => {
    const result = tripRegistrationSchema.safeParse({
      fullName: "علی داوودی کیا",
      phone: "09123456789",
      nationalId: "12345",
      emergencyPhone: "",
      medicalNotes: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts empty optional fields", () => {
    const result = tripRegistrationSchema.safeParse({
      fullName: "علی داوودی کیا",
      phone: "09123456789",
      nationalId: "1234567890",
      emergencyPhone: "",
      medicalNotes: "",
    });

    expect(result.success).toBe(true);
  });
});
