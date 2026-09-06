import Link from "next/link";
import { signOut } from "@/auth";

type AdminLayoutProps = {
  children: React.ReactNode;
  params: {
    clubSlug: string;
  };
};

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/clubs/${params.clubSlug}`} className="text-cyan-300 hover:text-cyan-200">
              صفحه باشگاه
            </Link>
            <Link href={`/clubs/${params.clubSlug}/admin`} className="text-slate-200 hover:text-white">
              داشبورد مدیریت
            </Link>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              خروج
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
