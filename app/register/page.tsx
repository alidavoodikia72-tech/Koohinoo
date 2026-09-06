import Link from "next/link";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">ایجاد حساب کاربری</h1>
        <p className="mb-6 text-sm text-gray-600">
          برای استفاده از امکانات کوهینو ثبت‌نام کنید.
        </p>

        <RegisterForm />

        <p className="mt-4 text-sm text-gray-600">
          قبلاً حساب دارید؟{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            ورود
          </Link>
        </p>
      </div>
    </main>
  );
}
