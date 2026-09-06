import {
  getTripRemainingCapacity,
  getTripRegisteredCount,
} from "@/lib/trip-registrations-store";
import { clubs } from "@/data/clubs";
import { trips } from "@/data/trips";
import { notFound } from "next/navigation";
import { TripRegistrationForm } from "@/components/trip-registration-form";

export default async function TripDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const trip = trips.find((item) => item.slug === slug);

  if (!trip) {
    notFound();
  }

  const club = clubs.find(
    (item) => item.id === trip.clubId && item.isActive
  );

  if (!club) {
    notFound();
  }

  const remaining = getTripRemainingCapacity(slug);
  const count = getTripRegisteredCount(slug);

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-10 text-white">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-cyan-400">{club.name}</p>
          <h1 className="text-4xl font-black">{trip.title}</h1>
          <p className="text-slate-400">{trip.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <p className="text-sm text-slate-500">ظرفیت باقیمانده</p>
            <p className="text-2xl font-bold text-emerald-400">
              {remaining} نفر
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">تعداد ثبت‌نام شده</p>
            <p className="text-2xl font-bold">{count} نفر</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-8">
        {remaining > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">ثبت‌نام در این برنامه</h2>

            <TripRegistrationForm
              clubSlug={club.slug}
              tripSlug={trip.slug}
              tripTitle={trip.title}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-rose-800 bg-rose-950 p-6 text-center">
            <p className="font-bold text-rose-400">
              ظرفیت این برنامه تکمیل شده است.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
