import Link from "next/link";
import { notFound } from "next/navigation";

import { clubs } from "@/data/clubs";
import { trips } from "@/data/trips";
import {
  getTripRemainingCapacity,
  getTripRegisteredCount,
} from "@/lib/trip-registrations-store";
import { TripRegistrationForm } from "@/components/trip-registration-form";

export default async function ClubTripDetailsPage({
  params,
}: {
  params: {
    clubSlug: string;
    tripSlug: string;
  };
}) {
  const club = clubs.find(
    (item) => item.slug === params.clubSlug && item.isActive
  );

  if (!club) {
    notFound();
  }

  const trip = trips.find(
    (item) => item.slug === params.tripSlug && item.clubId === club.id
  );

  if (!trip) {
    notFound();
  }

  const registeredCount = getTripRegisteredCount(trip.slug);
  const remainingCapacity = getTripRemainingCapacity(trip.slug);
  const isRegistrationClosed =
    trip.status !== "open" || remainingCapacity <= 0;

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-6 text-white md:p-10">
      <div className="space-y-4">
        <Link
          href={`/clubs/${club.slug}`}
          className="inline-flex text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          بازگشت به صفحه باشگاه
        </Link>

        <div className="space-y-3 border-b border-slate-800 pb-8">
          <p className="text-sm font-medium text-slate-400">{club.name}</p>

          <h1 className="text-3xl font-black md:text-5xl">{trip.title}</h1>

          <p className="max-w-3xl text-sm leading-7 text-slate-400 md:text-base">
            {trip.description}
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-500">تاریخ</p>
          <p className="mt-2 font-bold text-slate-100">{trip.date}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-500">مدت برنامه</p>
          <p className="mt-2 font-bold text-slate-100">{trip.duration}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-500">سطح سختی</p>
          <p className="mt-2 font-bold text-slate-100">{trip.difficulty}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-500">محل اجرا</p>
          <p className="mt-2 font-bold text-slate-100">{trip.location}</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">وضعیت ظرفیت</h2>

          <div className="grid gap-4">
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-500">ظرفیت کل</p>
              <p className="mt-1 text-2xl font-black">{trip.capacity} نفر</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-500">ثبت‌نام شده</p>
              <p className="mt-1 text-2xl font-black text-cyan-400">
                {registeredCount} نفر
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-500">ظرفیت باقی‌مانده</p>
              <p className="mt-1 text-2xl font-black text-emerald-400">
                {remainingCapacity} نفر
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-500">هزینه ثبت‌نام</p>
              <p className="mt-1 text-2xl font-black">
                {trip.price.toLocaleString("fa-IR")} تومان
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {isRegistrationClosed ? (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-rose-900 bg-rose-950/40 p-6 text-center">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-rose-300">
                  ثبت‌نام این برنامه فعال نیست.
                </h2>
                <p className="text-sm leading-6 text-rose-100/70">
                  ظرفیت برنامه تکمیل شده یا وضعیت برنامه بسته شده است.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">فرم ثبت‌نام</h2>
                <p className="text-sm text-slate-400">
                  اطلاعات شرکت‌کننده را برای ثبت‌نام در این برنامه وارد کنید.
                </p>
              </div>

              <TripRegistrationForm
                clubSlug={club.slug}
                tripSlug={trip.slug}
                tripTitle={trip.title}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
