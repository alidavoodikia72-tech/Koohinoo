import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">پنل مدیریت</h1>
      <p className="mt-2 text-sm text-gray-600">
        فقط کاربران ادمین می‌توانند این صفحه را ببینند.
      </p>
    </main>
  );
}
