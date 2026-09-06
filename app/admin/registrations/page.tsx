import Link from "next/link";
import { trips } from "@/data/trips";
import { getAllRegistrations } from "@/lib/registrations-store";

type AdminRegistrationsPageProps = {
  searchParams?: {
    trip?: string;
  };
};

export default async function AdminRegistrationsPage({
  searchParams,
}: AdminRegistrationsPageProps) {
  const selectedTrip = searchParams?.trip ?? "";
  const registrations = await getAllRegistrations();

  const filteredRegistrations = selectedTrip
    ? registrations.filter((item) => item.tripSlug === selectedTrip)
    : registrations;

  const registrationsWithTrip = filteredRegistrations.map((registration) => {
    const trip = trips.find((item) => item.slug === registration.tripSlug);

    return {
      ...registration,
      tripTitle: trip?.title ?? registration.tripSlug,
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">ثبت نام های برنامه ها</h1>
          <p className="text-sm text-slate-300">
            مشاهده، فیلتر و خروجی گرفتن از ثبت نام ها
          </p>
        </div>

        <Link
          href={
            selectedTrip
              ? `/admin/registrations/export?trip=${selectedTrip}`
              : "/admin/registrations/export"
          }
          className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          خروجی CSV
        </Link>
      </div>

      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          name="trip"
          defaultValue={selectedTrip}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none sm:max-w-sm"
        >
          <option value="">همه برنامه ها</option>
          {trips.map((trip) => (
            <option key={trip.slug} value={trip.slug}>
              {trip.title}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
        >
          اعمال فیلتر
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="bg-white/5">
              <tr className="text-sm text-slate-300">
                <th className="px-4 py-3 font-medium">برنامه</th>
                <th className="px-4 py-3 font-medium">نام</th>
                <th className="px-4 py-3 font-medium">موبایل</th>
                <th className="px-4 py-3 font-medium">کد ملی</th>
                <th className="px-4 py-3 font-medium">تماس اضطراری</th>
                <th className="px-4 py-3 font-medium">توضیحات پزشکی</th>
                <th className="px-4 py-3 font-medium">زمان ثبت</th>
              </tr>
            </thead>

            <tbody>
              {registrationsWithTrip.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    موردی برای نمایش وجود ندارد.
                  </td>
                </tr>
              ) : (
                registrationsWithTrip.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-white/10 text-sm text-white"
                  >
                    <td className="px-4 py-3">{item.tripTitle}</td>
                    <td className="px-4 py-3">{item.fullName}</td>
                    <td className="px-4 py-3">{item.phone}</td>
                    <td className="px-4 py-3">{item.nationalId}</td>
                    <td className="px-4 py-3">{item.emergencyPhone || "-"}</td>
                    <td className="px-4 py-3">{item.medicalNotes || "-"}</td>
                    <td className="px-4 py-3">
                      {new Date(item.createdAt).toLocaleString("fa-IR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
