import { NextResponse } from "next/server";
import { 
  getTripRemainingCapacity, 
  getTripRegisteredCount, 
  getTripRegistrations 
} from "@/lib/trip-registrations-store";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  return NextResponse.json({
    data: {
      registeredCount: getTripRegisteredCount(slug),
      remainingCapacity: getTripRemainingCapacity(slug), // اصلاح شد: فقط slug
      registrations: getTripRegistrations(slug),
    },
  });
}

// (سایر بخش‌های POST را هم مانند قبل نگه دار، فقط همین فراخوانی GET را اصلاح کن)
