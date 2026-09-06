"use client";

import { useState, useTransition } from "react";
import { loginAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = {
  success: false,
};

export default function LoginForm() {
  const [state, setState] = useState<LoginFormState>(initialState);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          const result = await loginAction(initialState, formData);
          setState(result);
        });
      }}
    >
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="example@email.com"
        />
        {state.fieldErrors?.email?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="******"
        />
        {state.fieldErrors?.password?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      {state.message && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}
