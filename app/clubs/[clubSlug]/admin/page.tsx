import Link from "next/link";
import { notFound } from "next/navigation";

import { clubs } from "@/data/clubs";
import { trips } from "@/data/trips";

type ClubAdminDashboardPageProps = {
  params: {
    clubSlug: string;
  };
};

export default function ClubAdminDashboardPage({
  params,
}: ClubAdminDashboardPageProps) {
  const club = clubs.find((item) => item.slug === params.clubSlug);

  if (!club) {
    notFound();
  }

  const clubTrips = trips.filter((trip) => trip.clubId === club.id);
  // وضعیت‌های فعال را مطابق مدل تو "open" در نظر می‌گیریم
  const activeTrips = clubTrips.filter((trip) => trip.status === "open");

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-slate-400">داشبورد مدیریتی</p>
        <h2 className="mt-2 text-3xl font-black text-white">{club.name}</h2>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">کل برنامه‌ها</p>
          <strong className="mt-3 block text-3xl text-white">
            {clubTrips.length}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">برنامه‌های باز</p>
          <strong className="mt-3 block text-3xl text-emerald-300">
            {activeTrips.length}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">ثبت‌نامی‌ها</p>
          <strong className="mt-3 block text-3xl text-cyan-300">۰</strong>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Link
          href={`/clubs/${club.slug}/admin/trips`}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-700 hover:bg-slate-800"
        >
          <h3 className="text-xl font-bold text-white">مدیریت برنامه‌ها</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            مشاهده و مدیریت وضعیت برنامه‌ها.
          </p>
        </Link>

        <Link
          href={`/clubs/${club.slug}/admin/registrations`}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-700 hover:bg-slate-800"
        >
          <h3 className="text-xl font-bold text-white">مدیریت ثبت‌نامی‌ها</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            مشاهده لیست شرکت‌کنندگان در هر برنامه.
          </p>
        </Link>
      </section>
    </div>
  );
}
