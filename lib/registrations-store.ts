import { promises as fs } from "fs";
import path from "path";

export type Registration = {
  id: string;
  tripSlug: string;
  fullName: string;
  phone: string;
  nationalId: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  createdAt: string;
};

const dataDir = path.join(process.cwd(), ".data");
const registrationsFile = path.join(dataDir, "registrations.json");

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(registrationsFile);
  } catch {
    await fs.writeFile(registrationsFile, "[]", "utf8");
  }
}

async function readRegistrations(): Promise<Registration[]> {
  await ensureStorage();

  const content = await fs.readFile(registrationsFile, "utf8");

  try {
    const parsed = JSON.parse(content) as Registration[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRegistrations(registrations: Registration[]) {
  await ensureStorage();
  await fs.writeFile(
    registrationsFile,
    JSON.stringify(registrations, null, 2),
    "utf8"
  );
}

export async function getAllRegistrations(): Promise<Registration[]> {
  return readRegistrations();
}

export async function getRegistrationsByTripSlug(
  tripSlug: string
): Promise<Registration[]> {
  const registrations = await readRegistrations();
  return registrations.filter((item) => item.tripSlug === tripSlug);
}

type AddRegistrationInput = {
  tripSlug: string;
  fullName: string;
  phone: string;
  nationalId: string;
  emergencyPhone?: string;
  medicalNotes?: string;
};

export async function addRegistration(
  input: AddRegistrationInput
): Promise<Registration> {
  const registrations = await readRegistrations();

  const duplicate = registrations.find(
    (item) =>
      item.tripSlug === input.tripSlug &&
      (item.phone === input.phone || item.nationalId === input.nationalId)
  );

  if (duplicate) {
    throw new Error("DUPLICATE_REGISTRATION");
  }

  const registration: Registration = {
    id: crypto.randomUUID(),
    tripSlug: input.tripSlug,
    fullName: input.fullName,
    phone: input.phone,
    nationalId: input.nationalId,
    emergencyPhone: input.emergencyPhone,
    medicalNotes: input.medicalNotes,
    createdAt: new Date().toISOString(),
  };

  registrations.push(registration);
  await writeRegistrations(registrations);

  return registration;
}
