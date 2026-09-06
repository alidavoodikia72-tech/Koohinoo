import { signOut } from "@/auth";

export default function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="rounded-lg bg-red-600 px-4 py-2 text-white"
      >
        خروج
      </button>
    </form>
  );
}
