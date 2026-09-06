import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("fa-IR");
}

export default async function TripDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      club: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!trip) return notFound();

  const descriptionText =
    typeof trip.description === "string" && trip.description.trim().length > 0
      ? trip.description
      : "توضیحی ثبت نشده است.";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{trip.title}</h1>

      <div className="grid gap-2 text-sm">
        <span>باشگاه: {trip.club.name}</span>
        <span>اسلاگ باشگاه: {trip.club.slug}</span>
        <span>مکان: {trip.location}</span>
        <span>درجه سختی: {trip.difficulty}</span>
        <span>ظرفیت: {trip.capacity}</span>
        <span>هزینه: {trip.price.toLocaleString("fa-IR")} تومان</span>
        <span>وضعیت: {trip.status}</span>
        <span>تاریخ شروع: {formatDate(trip.startDate)}</span>
        <span>
          تاریخ پایان: {trip.endDate ? formatDate(trip.endDate) : "ندارد"}
        </span>
      </div>

      <p className="leading-8">{descriptionText}</p>
    </div>
  );
}
