import { InnerPageHeader } from "@/components/inner-page-header";

export default function ClubsPage() {
  return (
    <main className="pb-14">
      <InnerPageHeader
        eyebrow="CLUBS"
        title="باشگاه‌ها"
        description="مدیریت باشگاه‌های فعال، اعضا، برنامه‌های آینده و ساختار اجرایی باشگاه‌ها در این بخش انجام می‌شود."
      />

      <section className="mx-auto mt-8 grid max-w-6xl gap-4 px-6 md:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">لیست باشگاه‌ها</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            در مرحله بعد جدول باشگاه‌ها با جستجو، فیلتر شهر و وضعیت فعالیت اضافه
            می‌شود.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">درخواست عضویت</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            کاربران می‌توانند درخواست عضویت در باشگاه را ثبت و وضعیت تایید را
            پیگیری کنند.
          </p>
        </div>
      </section>
    </main>
  );
}
