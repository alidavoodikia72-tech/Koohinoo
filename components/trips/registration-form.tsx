"use client";

import { useRef, useState, useTransition } from "react";
import { submitRegistration } from "@/lib/actions/register";

type RegistrationFormProps = {
  tripSlug: string;
};

type SubmitResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    }
  | null;

export default function RegistrationForm({
  tripSlug,
}: RegistrationFormProps) {
  const [result, setResult] = useState<SubmitResult>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = await submitRegistration(tripSlug, formData);
      setResult(response);

      if (response.success) {
        formRef.current?.reset();
      }
    });
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6 space-y-2">
        <h2 className="text-xl font-bold text-white">فرم ثبت نام</h2>
        <p className="text-sm text-slate-300">
          اطلاعات خود را برای ثبت نام در این برنامه وارد کنید.
        </p>
      </div>

      <form ref={formRef} action={handleSubmit} className="grid gap-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">
            نام و نام خانوادگی
          </label>
          <input
            type="text"
            name="fullName"
            disabled={isPending}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 focus:ring"
            placeholder="مثلاً علی داوودی کیا"
          />
          {result && !result.success && result.fieldErrors?.fullName?.[0] ? (
            <p className="mt-1 text-xs text-rose-300">
              {result.fieldErrors.fullName[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            شماره موبایل
          </label>
          <input
            type="text"
            name="phone"
            disabled={isPending}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 focus:ring"
            placeholder="09xxxxxxxxx"
          />
          {result && !result.success && result.fieldErrors?.phone?.[0] ? (
            <p className="mt-1 text-xs text-rose-300">
              {result.fieldErrors.phone[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">کد ملی</label>
          <input
            type="text"
            name="nationalId"
            disabled={isPending}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 focus:ring"
            placeholder="10 رقم"
          />
          {result && !result.success && result.fieldErrors?.nationalId?.[0] ? (
            <p className="mt-1 text-xs text-rose-300">
              {result.fieldErrors.nationalId[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            شماره تماس اضطراری
          </label>
          <input
            type="text"
            name="emergencyPhone"
            disabled={isPending}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 focus:ring"
            placeholder="اختیاری"
          />
          {result &&
          !result.success &&
          result.fieldErrors?.emergencyPhone?.[0] ? (
            <p className="mt-1 text-xs text-rose-300">
              {result.fieldErrors.emergencyPhone[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            توضیحات پزشکی
          </label>
          <textarea
            name="medicalNotes"
            rows={4}
            disabled={isPending}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-cyan-400/30 focus:ring"
            placeholder="در صورت نیاز وارد کنید"
          />
          {result && !result.success && result.fieldErrors?.medicalNotes?.[0] ? (
            <p className="mt-1 text-xs text-rose-300">
              {result.fieldErrors.medicalNotes[0]}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "در حال ثبت..." : "ثبت نام در برنامه"}
          </button>

          {result ? (
            <p
              className={`text-sm ${
                result.success ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {result.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
