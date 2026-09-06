"use client";

import { useState, useTransition } from "react";
import type { RegisterFormState } from "./actions";
import { registerAction } from "./actions";

const initialState: RegisterFormState = {
  success: false,
  message: "",
  fieldErrors: {},
};

export default function RegisterForm() {
  const [state, setState] = useState<RegisterFormState>(initialState);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await registerAction(state, formData);
      setState(result);
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          نام
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          placeholder="مثلاً علی داوودی کیا"
        />
        {state.fieldErrors?.name?.[0] && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          placeholder="you@example.com"
        />
        {state.fieldErrors?.email?.[0] && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          placeholder="حداقل ۶ کاراکتر"
        />
        {state.fieldErrors?.password?.[0] && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
          تکرار رمز عبور
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          placeholder="تکرار رمز عبور"
        />
        {state.fieldErrors?.confirmPassword?.[0] && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "در حال ثبت‌نام..." : "ثبت‌نام"}
      </button>
    </form>
  );
}
