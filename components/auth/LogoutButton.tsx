"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-red-900/20"
    >
      خروج از حساب کاربری
    </button>
  );
}
