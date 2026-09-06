import { NextResponse } from "next/server";
import { clubs } from "@/data/clubs";
import { trips } from "@/data/trips";
import { addTripRegistration, getTripRemainingCapacity } from "@/lib/trip-registrations-store";

export async function POST(req: Request, { params }: { params: { clubSlug: string; tripSlug: string } }) {
  const club = clubs.find(c => c.slug === params.clubSlug);
  const trip = trips.find(t => t.slug === params.tripSlug && t.clubId === club?.id);
  if (!trip) return NextResponse.json({ message: "Not Found" }, { status: 404 });
  
  const body = await req.json();
  if (getTripRemainingCapacity(trip.slug) <= 0) return NextResponse.json({ message: "Full" }, { status: 400 });
  
  const reg = addTripRegistration(trip.slug, body);
  return NextResponse.json({ success: true, reg });
}
