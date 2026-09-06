import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

// هلپرها برای نمایش بهتر اعداد و تاریخ
const formatPrice = (amount: number) => new Intl.NumberFormat("fa-IR").format(amount);
const formatDate = (date: Date) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(date);

export default async function UserPaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const payments = await prisma.payment.findMany({
    where: { booking: { userId: session.user.id } },
    include: {
      booking: {
        include: {
          trip: {
            select: {
              id: true,
              title: true,
              location: true,
              startDate: true,
              endDate: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10" dir="rtl">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">تراکنش‌های مالی من</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">سوابق پرداخت و وضعیت رزرو برنامه‌های کوهنوردی</p>
        </div>
        <Link 
          href="/dashboard/trips" 
          className="rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
        >
          بازگشت به برنامه‌های من
        </Link>
      </div>

      <div className="grid gap-6">
        {payments.map((payment) => (
          <div key={payment.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col lg:flex-row">
              {/* بخش اطلاعات برنامه */}
              <div className="flex-1 p-6 lg:p-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    payment.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
                    payment.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                    "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  }`}>
                    وضعیت پرداخت: {payment.status === "SUCCESS" ? "موفق" : payment.status === "PENDING" ? "در انتظار" : "ناموفق"}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {payment.method === "ONLINE" ? "درگاه آنلاین" : payment.method === "CARD_TRANSFER" ? "فیش واریزی" : "کیف پول"}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  {payment.booking.trip.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  مقصد: {payment.booking.trip.location} | شروع: {formatDate(payment.booking.trip.startDate)}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-zinc-400">مبلغ واریزی</p>
                    <p className="font-bold text-zinc-900 dark:text-white">{formatPrice(payment.amount)} تومان</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">تعداد نفرات</p>
                    <p className="font-bold text-zinc-900 dark:text-white">{payment.booking.participantCount} نفر</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-zinc-400">شناسه پیگیری</p>
                    <p className="truncate font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400">{payment.referenceId || "---"}</p>
                  </div>
                </div>
              </div>

              {/* سایدبار وضعیت رزرو */}
              <div className="w-full bg-zinc-50 p-6 dark:bg-zinc-800/50 lg:w-72 lg:p-8">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">وضعیت نهایی رزرو</p>
                <div className="mt-4">
                  {payment.booking.status === "CONFIRMED" ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <div className="h-2 w-2 rounded-full bg-current" />
                      <span className="font-black">تایید شده</span>
                    </div>
                  ) : payment.booking.status === "CANCELLED" ? (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <div className="h-2 w-2 rounded-full bg-current" />
                      <span className="font-black">لغو شده</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <div className="h-2 w-2 rounded-full bg-current" />
                      <span className="font-black">در انتظار تایید</span>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {payment.booking.status === "CONFIRMED" 
                    ? "رزرو شما نهایی شده است. تجهیزات لازم را طبق لیست برنامه آماده کنید."
                    : "در صورت واریز کارت‌به‌کارت، تایید رزرو تا ۲۴ ساعت زمان می‌برد."}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
