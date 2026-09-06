import Link from "next/link";
import { trips, type TripStatus } from "@/lib/data/trips";

function getStatusClasses(status: TripStatus) {
  if (status === "open") return "bg-green-500/10 text-green-400";
  if (status === "full") return "bg-red-500/10 text-red-400";
  return "bg-slate-500/10 text-slate-400";
}

function getStatusLabel(status: TripStatus) {
  if (status === "open") return "ظرفیت باز";
  if (status === "full") return "تکمیل شده";
  return "بسته";
}

export default function TripsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">برنامه‌های صعود</h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            فهرست برنامه‌های فعال باشگاه برای بررسی و ثبت‌نام
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <article
              key={trip.slug}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900"
            >
              <div className="aspect-[16/10] bg-slate-800" />

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(
                      trip.status
                    )}`}
                  >
                    {getStatusLabel(trip.status)}
                  </span>
                  <span className="text-xs text-slate-400">{trip.date}</span>
                </div>

                <h2 className="text-lg font-semibold">{trip.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{trip.subtitle}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div>
                    <span className="block text-xs text-slate-500">موقعیت</span>
                    <span>{trip.location}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">مدت</span>
                    <span>{trip.duration}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">سختی</span>
                    <span>{trip.difficulty}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">ظرفیت</span>
                    <span>{trip.capacity} نفر</span>
                  </div>
                </div>

                <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
                  {trip.summary}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">
                    {trip.price.toLocaleString("fa-IR")} تومان
                  </span>

                  <Link
                    href={`/trips/${trip.slug}`}
                    className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                  >
                    مشاهده جزئیات
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
