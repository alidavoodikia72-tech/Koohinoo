import { prisma } from "@/lib/prisma";
import CreateTripForm from "./CreateTripForm";

export const dynamic = 'force-dynamic';
export default async function NewTripPage() {
  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      slug: true, // ضروری
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">ایجاد برنامه جدید</h1>
      <CreateTripForm clubs={clubs} />
    </div>
  );
}
