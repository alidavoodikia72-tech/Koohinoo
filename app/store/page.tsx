import { InnerPageHeader } from "@/components/inner-page-header";

export default function StorePage() {
  return (
    <main className="pb-14">
      <InnerPageHeader
        eyebrow="STORE"
        title="فروشگاه تجهیزات"
        description="در این بخش تجهیزات کوهنوردی، سفارش‌ها، پرداخت و وضعیت ارسال برای اعضا و باشگاه‌ها مدیریت می‌شود."
      />

      <section className="mx-auto mt-8 grid max-w-6xl gap-4 px-6 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-white">دسته‌بندی کالا</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            کفش، پوشاک، کوله، ابزار فنی و کمپینگ.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-white">سبد خرید</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            مدیریت تعداد، تخفیف باشگاهی و تسویه سفارش.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-white">پیگیری سفارش</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            مشاهده وضعیت آماده‌سازی، ارسال و تحویل.
          </p>
        </div>
      </section>
    </main>
  );
}
