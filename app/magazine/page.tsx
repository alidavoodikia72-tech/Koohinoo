import { InnerPageHeader } from "@/components/inner-page-header";

export default function MagazinePage() {
  return (
    <main className="pb-14">
      <InnerPageHeader
        eyebrow="MAGAZINE"
        title="مجله آموزشی"
        description="مقالات آموزشی، نکات ایمنی، راهنماهای صعود و کمپینگ برای توسعه دانش جامعه کوهنوردی."
      />

      <section className="mx-auto mt-8 grid max-w-6xl gap-4 px-6 md:grid-cols-2">
        <article className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">
            راهنمای آمادگی صعود یک‌روزه
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            چک‌لیست تجهیزات، زمان‌بندی حرکت، تغذیه و مدیریت انرژی قبل و حین صعود.
          </p>
        </article>

        <article className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">
            اصول ایمنی در برنامه‌های گروهی
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            نقش لیدر، فاصله‌گذاری تیم، تصمیم‌گیری در شرایط متغیر و مدیریت ریسک.
          </p>
        </article>
      </section>
    </main>
  );
}
