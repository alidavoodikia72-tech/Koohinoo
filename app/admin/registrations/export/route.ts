import { NextResponse } from "next/server";
import { trips } from "@/data/trips";
import { getAllRegistrations } from "@/lib/registrations-store";

function escapeCsv(value: string) {
  const normalized = value.replace(/"/g, '""');
  return `"${normalized}"`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const selectedTrip = searchParams.get("trip") ?? "";

  const registrations = await getAllRegistrations();

  const filteredRegistrations = selectedTrip
    ? registrations.filter((item) => item.tripSlug === selectedTrip)
    : registrations;

  const rows = filteredRegistrations.map((item) => {
    const trip = trips.find((tripItem) => tripItem.slug === item.tripSlug);

    return [
      trip?.title ?? item.tripSlug,
      item.fullName,
      item.phone,
      item.nationalId,
      item.emergencyPhone ?? "",
      item.medicalNotes ?? "",
      item.createdAt,
    ]
      .map((value) => escapeCsv(String(value)))
      .join(",");
  });

  const csv = [
    [
      "trip",
      "fullName",
      "phone",
      "nationalId",
      "emergencyPhone",
      "medicalNotes",
      "createdAt",
    ].join(","),
    ...rows,
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="registrations-export.csv"',
    },
  });
}
