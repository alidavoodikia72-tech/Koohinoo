import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditTripForm from "./EditTripForm";
import type { EditableTrip } from "@/types/trip";

export default async function EditTripPage({
  params,
}: {
  params: { id: string };
}) {
  const [trip, clubs] = await Promise.all([
    prisma.trip.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        difficulty: true,
        price: true,
        capacity: true,
        status: true,
        clubId: true,
      },
    }),
    prisma.club.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!trip) return notFound();

  const editableTrip: EditableTrip = trip;

  return (
    <div className="space-y-6">
      <h1>ویرایش برنامه</h1>
      <EditTripForm trip={editableTrip} clubs={clubs} />
    </div>
  );
}
