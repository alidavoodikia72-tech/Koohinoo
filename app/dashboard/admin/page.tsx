import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  Mountain,
  CalendarCheck2,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
} from "lucide-react";
import dynamic from "next/dynamic";

import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

const AdminCharts = dynamic(() => import("../../../components/admin/AdminCharts"), {
  ssr: false,
});

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
  return { start, end };
}

function getPreviousMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth() - 1, 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  return { start, end };
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1, 0, 0, 0, 0);
}

function formatMonthLabelFa(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const abs = Math.abs(value);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
        positive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {formatNumber(Number(abs.toFixed(1)))}٪
    </span>
  );
}

type PaymentStatus = "SUCCESS" | "PENDING" | "FAILED";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const now = new Date();

  const { start: currentMonthStart, end: currentMonthEnd } = getMonthRange(now);
  const { start: prevMonthStart, end: prevMonthEnd } = getPreviousMonthRange(now);

  // نمودار ۶ ماه اخیر
  const thisMonthStart = getMonthStart(now);
  const sixMonthsStart = addMonths(thisMonthStart, -5); // ماه جاری + ۵ ماه قبل
  const nextMonthStart = addMonths(thisMonthStart, 1);

  // نمودار وضعیت پرداخت ۳۰ روز اخیر
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeTrips,
    totalConfirmedBookings,
    recentBookings,
    currentMonthRevenueAgg,
    previousMonthRevenueAgg,
    currentMonthSuccessfulPaymentsCount,
    pendingCardTransfersCount,
    successPaymentsFor6Months,
    paymentStatus30Days,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.trip.count({
      where: {
        startDate: { gte: now },
        // اگر فیلد status در Trip دارید و می‌خواهید برنامه‌های لغوشده حذف شوند:
        // status: { not: "CANCELLED" },
      },
    }),

    prisma.booking.count({
      where: { status: "CONFIRMED" },
    }),

    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        trip: { select: { title: true, startDate: true } },
      },
    }),

    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: currentMonthStart,
          lt: currentMonthEnd,
        },
      },
    }),

    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: prevMonthStart,
          lt: prevMonthEnd,
        },
      },
    }),

    prisma.payment.count({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: currentMonthStart,
          lt: currentMonthEnd,
        },
      },
    }),

    prisma.payment.count({
      where: {
        method: "CARD_TRANSFER",
        status: "PENDING",
      },
    }),

    prisma.payment.findMany({
      where: {
        status: "SUCCESS",
        createdAt: { gte: sixMonthsStart, lt: nextMonthStart },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    }),

    prisma.payment.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: last30Days, lte: now },
        status: { in: ["SUCCESS", "PENDING", "FAILED"] },
      },
      _count: { status: true },
    }),
  ]);

  const currentMonthRevenue = currentMonthRevenueAgg._sum.amount ?? 0;
  const previousMonthRevenue = previousMonthRevenueAgg._sum.amount ?? 0;
  const revenueChange = pctChange(currentMonthRevenue, previousMonthRevenue);

  const hasRecentBookings = recentBookings.length > 0;

  // --- آماده‌سازی داده نمودار درآمد ۶ ماه ---
  const monthBuckets: { key: string; label: string; revenue: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const d = addMonths(thisMonthStart, i - 5);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthBuckets.push({
      key,
      label: formatMonthLabelFa(d),
      revenue: 0,
    });
  }

  for (const p of successPaymentsFor6Months) {
    const d = p.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthBuckets.find((m) => m.key === key);
    if (bucket) bucket.revenue += p.amount;
  }

  // --- آماده‌سازی داده نمودار وضعیت پرداخت ---
  const statusBase: PaymentStatus[] = ["SUCCESS", "PENDING", "FAILED"];

  const paymentStatusChart = statusBase.map((s) => {
    const found = paymentStatus30Days.find((x) => x.status === s);
    return {
      status: s,
      count: found?._count.status ?? 0,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white md:text-3xl">
            داشبورد مدیریت
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            نمای کلی از وضعیت کاربران، برنامه‌ها، رزروها و درآمد باشگاه
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/admin/payments"
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            مدیریت پرداخت‌ها
          </Link>
          <Link
            href="/dashboard/admin/trips"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            مدیریت برنامه‌ها
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">کل کاربران</span>
            <Users size={18} className="text-zinc-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">{formatNumber(totalUsers)}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">برنامه‌های فعال/آتی</span>
            <Mountain size={18} className="text-zinc-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">{formatNumber(activeTrips)}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">رزروهای تاییدشده</span>
            <CalendarCheck2 size={18} className="text-zinc-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {formatNumber(totalConfirmedBookings)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">درآمد ماه جاری</span>
            <Wallet size={18} className="text-zinc-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {formatCurrency(currentMonthRevenue)}
          </p>
          <div className="mt-3">
            <TrendBadge value={revenueChange} />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">پرداخت موفق ماه جاری</span>
            <CreditCard size={18} className="text-zinc-500" />
          </div>
          <p className="text-xl font-extrabold text-zinc-900 dark:text-white">
            {formatNumber(currentMonthSuccessfulPaymentsCount)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">کارت‌به‌کارت در انتظار بررسی</span>
            <Activity size={18} className="text-zinc-500" />
          </div>
          <p className="text-xl font-extrabold text-zinc-900 dark:text-white">
            {formatNumber(pendingCardTransfersCount)}
          </p>
          <Link
            href="/dashboard/admin/payments"
            className="mt-3 inline-block text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            رفتن به صف بررسی پرداخت‌ها
          </Link>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8">
        <AdminCharts revenue6Months={monthBuckets} paymentStatus={paymentStatusChart} />
      </div>

      {/* Recent bookings */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-black text-zinc-800 dark:text-zinc-100">آخرین رزروها</h2>
        </div>

        {!hasRecentBookings ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">هنوز رزروی ثبت نشده است.</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentBookings.map((booking) => (
              <li key={booking.id} className="px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {booking.user.name || "کاربر بدون نام"}{" "}
                      <span className="font-normal text-zinc-500">({booking.user.email})</span>
                    </p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{booking.trip.title}</p>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Intl.DateTimeFormat("fa-IR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(booking.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
