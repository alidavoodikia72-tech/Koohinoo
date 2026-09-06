import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h1 className="text-2xl font-bold">دسترسی غیرمجاز</h1>
        <p className="mt-4 text-slate-400">
          شما اجازه دسترسی به این بخش را ندارید.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500"
        >
          بازگشت به داشبورد
        </Link>
      </div>
    </main>
  );
}
