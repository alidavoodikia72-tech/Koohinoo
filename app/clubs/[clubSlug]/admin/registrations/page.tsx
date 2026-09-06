import { notFound } from "next/navigation";
import { clubs } from "@/data/clubs";
import { trips } from "@/data/trips";

type AdminRegistrationsPageProps = {
  params: {
    clubSlug: string;
  };
};

export default function AdminRegistrationsPage({
  params,
}: AdminRegistrationsPageProps) {
  const club = clubs.find((item) => item.slug === params.clubSlug);

  if (!club) {
    notFound();
  }

  const clubTrips = trips.filter((trip) => trip.clubId === club.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-slate-400">مدیریت ثبت‌نامی‌ها</p>
        <h2 className="mt-2 text-3xl font-black text-white">{club.name}</h2>
      </header>

      <section className="grid gap-4">
        {clubTrips.length > 0 ? (
          clubTrips.map((trip) => (
            <div
              key={trip.slug}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{trip.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    ظرفیت: {trip.registered} نفر از {trip.capacity} نفر ثبت‌نام کرده‌اند.
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">
            هنوز برنامه‌ای برای این باشگاه ثبت نشده است.
          </div>
        )}
      </section>
    </div>
  );
}
