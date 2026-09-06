import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const session = await auth();

  // امنیت اضافی: اگر سشن نبود به لاگین برو (هرچند Middleware این کار را می‌کند)
  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">پیشخوان کاربری</h1>
          <p className="text-slate-400">به سامانه مدیریت کوهنوردی «کوهینو» خوش آمدید</p>
        </div>

        <div className="grid grid-cols-1 gap-4 text-right" dir="rtl">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <span className="text-sm text-slate-500 block mb-1">نام و نام خانوادگی:</span>
            <span className="text-lg font-medium text-blue-400">{user.name || "ثبت نشده"}</span>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <span className="text-sm text-slate-500 block mb-1">ایمیل حساب:</span>
            <span className="text-lg font-medium text-blue-400">{user.email}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="text-sm text-slate-500 block mb-1">سطح دسترسی:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800/50">
                {user.role}
              </span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="text-sm text-slate-500 block mb-1">شناسه سیستمی:</span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-tighter">
                {user.id}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex gap-4">
             <a 
              href="/dashboard/trips" 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all"
            >
              مدیریت برنامه‌ها
            </a>
            {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? (
              <a 
                href="/admin" 
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all"
              >
                پنل مدیریت
              </a>
            ) : null}
          </div>
          
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
