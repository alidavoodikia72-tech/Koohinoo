import { notFound } from "next/navigation";
import { clubs } from "@/data/clubs";
import { trips } from "@/data/trips";
import Link from "next/link";

export default async function ClubPage({ params }: { params: { clubSlug: string } }) {
  const club = clubs.find((c) => c.slug === params.clubSlug);
  
  if (!club || !club.isActive) {
    notFound();
  }

  // فیلتر کردن برنامه‌ها بر اساس clubId باشگاه جاری
  const clubTrips = trips.filter((t) => t.clubId === club.id);

  return (
    <div className="max-w-4xl mx-auto p-10 text-white">
      <header className="mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black text-cyan-400">{club.name}</h1>
        <p className="mt-2 text-slate-400">به صفحه اختصاصی باشگاه خوش آمدید.</p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mb-6">برنامه‌های پیش رو</h2>
        
        {clubTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clubTrips.map((trip) => (
              <Link 
                key={trip.slug} 
                href={`/clubs/${club.slug}/trips/${trip.slug}`}
                className="block p-6 rounded-2xl border border-slate-800 bg-slate-900 hover:border-cyan-500 transition-all"
              >
                <h3 className="text-xl font-bold">{trip.title}</h3>
                <p className="text-slate-400 mt-2">{trip.subtitle}</p>
                <div className="mt-4 flex gap-4 text-sm text-slate-500">
                  <span>{trip.date}</span>
                  <span>{trip.duration}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-slate-700 text-center text-slate-500">
            در حال حاضر برنامه‌ای برای این باشگاه ثبت نشده است.
          </div>
        )}
      </section>
    </div>
  );
}
