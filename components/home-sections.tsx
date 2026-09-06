const stats = [
  { value: "120+", label: "باشگاه فعال" },
  { value: "3,500+", label: "عضو ثبت شده" },
  { value: "860+", label: "برنامه صعود" },
];

const modules = [
  {
    title: "مدیریت باشگاه",
    description:
      "ثبت اعضا، تعریف نقش‌ها، مدیریت تیم‌ها و کنترل ساختار اجرایی باشگاه در یک پنل متمرکز.",
  },
  {
    title: "ثبت‌نام و اجرای صعود",
    description:
      "تعریف برنامه، ظرفیت، لیدر، مبدا حرکت، وضعیت تایید و فهرست کامل شرکت‌کنندگان.",
  },
  {
    title: "پنل مستقل اعضا",
    description:
      "هر کاربر سابقه صعودها، ثبت‌نام‌ها، پرداخت‌ها و وضعیت حساب خود را در پروفایل شخصی می‌بیند.",
  },
  {
    title: "فروشگاه تجهیزات",
    description:
      "ارائه تجهیزات موردنیاز برنامه‌ها، مدیریت سفارش‌ها و اتصال خریدها به حساب اعضا.",
  },
  {
    title: "مجله آموزشی",
    description:
      "انتشار مقاله‌های فنی، آموزش کمپینگ، نکات ایمنی و محتوای تخصصی برای جامعه کوهنوردی.",
  },
  {
    title: "پنل لیدرها",
    description:
      "لیدر هر برنامه می‌تواند اعضا، ظرفیت، یادداشت‌های اجرایی و وضعیت نهایی صعود را کنترل کند.",
  },
];

export function HomeSections() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/10 bg-white/5 px-6 py-5"
            >
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-2 text-sm text-slate-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-medium tracking-[0.2em] text-cyan-400">
              ماژول‌های اصلی
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              ساختار پایه برای رشد واقعی کوهینو
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              این بخش‌ها هسته اصلی محصول را می‌سازند. فعلاً آن‌ها را در صفحه
              اصلی نمایش می‌دهیم تا در مرحله‌های بعد هرکدام را به مسیر و رابط
              مستقل خود تبدیل کنیم.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((module) => (
              <div
                key={module.title}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-lg font-semibold text-white">
                  {module.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/5">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-white">
              مناسب باشگاه‌ها
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              برای مدیریت اعضا، ثبت‌نام، برنامه‌های صعود و ارتباط با تیم اجرایی.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">
              مناسب لیدرها
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              برای کنترل ظرفیت، تایید نفرات، جزئیات صعود و هماهنگی اجرایی برنامه.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">
              مناسب اعضا
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              برای مشاهده برنامه‌ها، ثبت‌نام، پیگیری سوابق و دسترسی به محتوای
              آموزشی.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
