import { notFound } from "next/navigation";
import { trips } from "@/data/trips";
import { TripRegistrationForm } from "@/components/trip-registration-form";
import {
  getTripRegistrations,
  isTripRegistrationClosed,
} from "@/lib/trip-registrations-store";

const CLUB_SLUG = "moj-no";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TripRegistrationsPage({ params }: PageProps) {
  const { slug } = await params;

  const trip = trips.find((t) => t.slug === slug);

  if (!trip) {
    notFound();
  }

  const registrations = getTripRegistrations(slug);
  const isClosed = isTripRegistrationClosed(slug);

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <header>
        <h1 className="text-3xl font-black text-white">{trip.title}</h1>
        <p className="text-slate-400">مدیریت و مشاهده ثبت‌نام کنندگان</p>
      </header>

      {!isClosed ? (
        <TripRegistrationForm
          clubSlug={CLUB_SLUG}
          tripSlug={slug}
          tripTitle={trip.title}
        />
      ) : (
        <div className="rounded-2xl border border-amber-500 bg-amber-500/10 p-4 text-amber-500">
          ثبت‌نام این برنامه به پایان رسیده است.
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-6">
          <h2 className="text-xl font-bold text-white">
            لیست همنوردان ثبت‌نام شده
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-slate-300">
            <thead className="bg-slate-950 text-sm text-slate-500">
              <tr>
                <th className="p-4">نام و نام خانوادگی</th>
                <th className="p-4">کد ملی</th>
                <th className="p-4">تاریخ ثبت</th>
              </tr>
            </thead>

            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-slate-500">
                    هنوز کسی ثبت‌نام نکرده است.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-slate-800 transition-colors hover:bg-slate-800/50"
                  >
                    <td className="p-4 font-medium text-white">{reg.fullName}</td>
                    <td className="p-4">{reg.nationalId}</td>
                    <td className="p-4 text-xs italic">
                      {new Date(reg.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
