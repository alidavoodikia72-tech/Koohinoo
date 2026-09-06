import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // پسوردهای ساده برای Seed (فقط محیط توسعه)
  const adminPlainPassword = "admin12345";
  const memberPlainPassword = "member12345";

  // هش کردن پسوردها
  const adminHashedPassword = await bcrypt.hash(adminPlainPassword, 10);
  const memberHashedPassword = await bcrypt.hash(memberPlainPassword, 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@koohinoo.ir" },
    update: {
      name: "مدیر کوهینو",
      password: adminHashedPassword,
      role: Role.ADMIN,
    },
    create: {
      email: "admin@koohinoo.ir",
      name: "مدیر کوهینو",
      password: adminHashedPassword,
      role: Role.ADMIN,
    },
  });

  // Member
  await prisma.user.upsert({
    where: { email: "member@koohinoo.ir" },
    update: {
      name: "عضو نمونه",
      password: memberHashedPassword,
      role: Role.MEMBER,
    },
    create: {
      email: "member@koohinoo.ir",
      name: "عضو نمونه",
      password: memberHashedPassword,
      role: Role.MEMBER,
    },
  });

  console.log("✅ Seed completed successfully.");
  console.log("Admin => admin@koohinoo.ir / admin12345");
  console.log("Member => member@koohinoo.ir / member12345");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
