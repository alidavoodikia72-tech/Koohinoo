import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { PaymentReviewActions } from "../../../../components/admin/PaymentReviewActions";

const formatPrice = (amount: number) => new Intl.NumberFormat("fa-IR").format(amount);
const formatDate = (date: Date) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(date);

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const payments = await prisma.payment.findMany({
    include: {
      booking: {
        include: {
          user: { select: { name: true, email: true } },
          trip: { select: { title: true, startDate: true, capacity: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-full px-6 py-10" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white">میز مدیریت مالی</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">بررسی و تایید تراکنش‌های ورودی باشگاه موج نو</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-right text-sm">
          <thead className="bg-zinc-50 text-xs font-bold text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-4">کاربر</th>
              <th className="px-6 py-4">برنامه</th>
              <th className="px-6 py-4">مبلغ (تومان)</th>
              <th className="px-6 py-4">روش و شناسه</th>
              <th className="px-6 py-4">وضعیت</th>
              <th className="px-6 py-4">عملیات مدیریت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                <td className="px-6 py-4">
                  <div className="font-bold text-zinc-900 dark:text-white">{p.booking.user.name || "کاربر عمومی"}</div>
                  <div className="text-[10px] text-zinc-400">{p.booking.user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-zinc-700 dark:text-zinc-300">{p.booking.trip.title}</div>
                  <div className="text-[10px] text-zinc-400">{formatDate(p.booking.trip.startDate)}</div>
                </td>
                <td className="px-6 py-4 font-black text-zinc-900 dark:text-white">
                  {formatPrice(p.amount)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                    {p.method === "CARD_TRANSFER" ? "کارت‌به‌کارت" : "آنلاین"}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-400">{p.referenceId || "فاقد کد مرجع"}</div>
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    p.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" :
                    p.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>
                    {p.status === "SUCCESS" ? "موفق" : p.status === "PENDING" ? "انتظار" : "خطا"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-48">
                    <PaymentReviewActions 
                      paymentId={p.id} 
                      method={p.method} 
                      status={p.status} 
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
