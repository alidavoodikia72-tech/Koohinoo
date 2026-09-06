export function HomeHero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pb-14 sm:pt-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm font-medium tracking-[0.2em] text-cyan-400">
            KOOHINOO PLATFORM
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            سامانه یکپارچه مدیریت باشگاه، صعود و خدمات کوهنوردی
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            کوهینو برای باشگاه‌های کوهنوردی، لیدرها و اعضا طراحی شده تا ثبت‌نام
            صعود، مدیریت نفرات، برنامه‌ریزی، فروش تجهیزات و محتوای آموزشی را در
            یک تجربه منسجم کنار هم قرار دهد.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
              شروع همکاری
            </button>
            <button className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5">
              مشاهده ماژول‌ها
            </button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-sm font-semibold text-white">
                ثبت‌نام صعود
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                ظرفیت، لیدر، زمان حرکت و لیست اعضا
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-sm font-semibold text-white">
                پنل باشگاه و لیدر
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                مدیریت ساختار، اعضا و برنامه‌ها
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-sm font-semibold text-white">
                فروشگاه و مجله
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                تجهیزات کوهنوردی و محتوای آموزشی
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="rounded-lg border border-white/10 bg-slate-900 p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-sm font-semibold text-white">
                  داشبورد برنامه صعود
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  نمای اولیه ماژول اجرایی کوهینو
                </div>
              </div>
              <div className="rounded-md bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                فعال
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-white/10 bg-slate-950 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      صعود الوند
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      جمعه | 05:30 | گنجنامه
                    </div>
                  </div>
                  <div className="rounded-md bg-cyan-500/15 px-3 py-1 text-xs text-cyan-300">
                    24 نفر
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-slate-950 px-4 py-4">
                  <div className="text-xs text-slate-400">لیدر برنامه</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    سرپرست باشگاه
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-slate-950 px-4 py-4">
                  <div className="text-xs text-slate-400">وضعیت ثبت‌نام</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    18 تایید شده
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-slate-950 px-4 py-4">
                <div className="text-xs text-slate-400">یادداشت اجرایی</div>
                <div className="mt-2 text-sm leading-6 text-slate-300">
                  بررسی تجهیزات الزامی، وضعیت آب‌وهوا و هماهنگی وسیله حرکت قبل
                  از صعود.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
