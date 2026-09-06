import Link from "next/link";
import { notFound } from "next/navigation";

import { clubs } from "@/data/clubs";
import { trips } from "@/data/trips";

type AdminTripsPageProps = {
  params: {
    clubSlug: string;
  };
};

export default function AdminTripsPage({ params }: AdminTripsPageProps) {
  const club = clubs.find((item) => item.slug === params.clubSlug);

  if (!club) {
    notFound();
  }

  const clubTrips = trips.filter((trip) => trip.clubId === club.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-400">مدیریت برنامه‌ها</p>
          <h2 className="mt-2 text-3xl font-black text-white">{club.name}</h2>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="grid grid-cols-12 border-b border-slate-800 px-5 py-4 text-sm text-slate-400">
          <div className="col-span-5">عنوان برنامه</div>
          <div className="col-span-2">وضعیت</div>
          <div className="col-span-2">ظرفیت</div>
          <div className="col-span-3">عملیات</div>
        </div>

        {clubTrips.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {clubTrips.map((trip) => (
              <div
                key={trip.slug}
                className="grid grid-cols-12 items-center px-5 py-4 text-sm"
              >
                <div className="col-span-5 font-medium text-white">
                  {trip.title}
                </div>

                <div className="col-span-2 text-slate-300">
                  {trip.status === "open" ? "باز" : trip.status === "full" ? "تکمیل شده" : "بسته"}
                </div>

                <div className="col-span-2 text-slate-300">
                  {trip.registered} / {trip.capacity}
                </div>

                <div className="col-span-3">
                  <Link
                    href={`/clubs/${club.slug}/trips/${trip.slug}`}
                    className="text-cyan-300 transition hover:text-cyan-200"
                  >
                    مشاهده صفحه برنامه
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            هنوز برنامه‌ای برای این باشگاه ثبت نشده است.
          </div>
        )}
      </section>
    </div>
  );
}
