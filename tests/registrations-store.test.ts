import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "fs/promises";
import path from "path";
import {
  addRegistration,
  getAllRegistrations,
  getRegistrationsByTripSlug,
} from "@/lib/registrations-store";

const dataDir = path.join(process.cwd(), ".data");
const registrationsFile = path.join(dataDir, "registrations.json");

describe("registrations-store", () => {
  beforeEach(async () => {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(registrationsFile, "[]", "utf8");
  });

  afterEach(async () => {
    await fs.writeFile(registrationsFile, "[]", "utf8");
  });

  it("adds a registration successfully", async () => {
    const registration = await addRegistration({
      tripSlug: "alvand-classic",
      fullName: "علی داوودی کیا",
      phone: "09123456789",
      nationalId: "1234567890",
      emergencyPhone: "09912345678",
      medicalNotes: "بدون مشکل",
    });

    expect(registration.tripSlug).toBe("alvand-classic");
    expect(registration.phone).toBe("09123456789");

    const all = await getAllRegistrations();
    expect(all).toHaveLength(1);
  });

  it("filters registrations by trip slug", async () => {
    await addRegistration({
      tripSlug: "alvand-classic",
      fullName: "علی",
      phone: "09123456789",
      nationalId: "1234567890",
    });

    await addRegistration({
      tripSlug: "damavand",
      fullName: "رضا",
      phone: "09111111111",
      nationalId: "1111111111",
    });

    const result = await getRegistrationsByTripSlug("alvand-classic");

    expect(result).toHaveLength(1);
    expect(result[0].tripSlug).toBe("alvand-classic");
  });

  it("prevents duplicate registration by phone", async () => {
    await addRegistration({
      tripSlug: "alvand-classic",
      fullName: "علی",
      phone: "09123456789",
      nationalId: "1234567890",
    });

    await expect(
      addRegistration({
        tripSlug: "alvand-classic",
        fullName: "علی دوم",
        phone: "09123456789",
        nationalId: "2222222222",
      })
    ).rejects.toThrow("DUPLICATE_REGISTRATION");
  });

  it("prevents duplicate registration by nationalId", async () => {
    await addRegistration({
      tripSlug: "alvand-classic",
      fullName: "علی",
      phone: "09123456789",
      nationalId: "1234567890",
    });

    await expect(
      addRegistration({
        tripSlug: "alvand-classic",
        fullName: "علی دوم",
        phone: "09999999999",
        nationalId: "1234567890",
      })
    ).rejects.toThrow("DUPLICATE_REGISTRATION");
  });
});
