import { auth } from "@/auth";

interface PageProps {
  params: { slug: string };
}

export default async function ClubPage({ params }: PageProps) {
  const session = await auth();

  return (
    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4 text-white">
      <p>باشگاه: {params.slug}</p>
      <p>کاربر: {session?.user?.name ?? "-"}</p>
      <p>نقش: {session?.user?.role ?? "-"}</p>
      <p>باشگاه کاربر: {session?.user?.clubId ?? "-"}</p>
    </div>
  );
}
