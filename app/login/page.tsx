import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">ورود</h1>
        <p className="mb-6 text-sm text-gray-600">
          برای ورود به حساب کاربری خود، ایمیل و رمز عبور را وارد کنید.
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
