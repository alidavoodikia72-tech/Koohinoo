import { clubs } from "@/data/clubs";
import Link from "next/link";

export default function HomePage() {
  // فقط باشگاه‌هایی را نشان می‌دهیم که isActive هستند
  const activeClubs = clubs.filter((c) => c.isActive);

  return (
    <main className="mx-auto max-w-4xl p-10 text-white">
      <header className="mb-12">
        <h1 className="text-5xl font-black mb-4">کوهینو</h1>
        <p className="text-xl text-slate-400">سامانه مدیریت و ثبت‌نام برنامه‌های باشگاه‌های کوهنوردی</p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mb-6">باشگاه‌های عضو</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeClubs.map((club) => (
            <Link 
              key={club.id} 
              href={`/clubs/${club.slug}`}
              className="group p-8 rounded-3xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-all"
            >
              <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                {club.name}
              </h3>
              <p className="text-slate-500">مشاهده برنامه‌های این باشگاه</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
