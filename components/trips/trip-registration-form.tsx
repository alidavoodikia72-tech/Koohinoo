"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tripRegistrationSchema,
  type TripRegistrationFormValues,
} from "@/lib/validators/trip-registration";

type Props = {
  tripSlug: string;
  tripTitle: string;
  isDisabled?: boolean;
};

export function TripRegistrationForm({
  tripSlug,
  tripTitle,
  isDisabled = false,
}: Props) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TripRegistrationFormValues>({
    resolver: zodResolver(tripRegistrationSchema),
    defaultValues: {
      fullName: "",
      nationalId: "",
      phone: "",
      emergencyPhone: "",
      medicalNotes: "",
      acceptRules: false,
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: TripRegistrationFormValues) => {
    setSuccessMessage(null);
    setServerError(null);

    try {
      const response = await fetch(`/api/trips/${tripSlug}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        setServerError(result.message ?? "ثبت نام انجام نشد");
        return;
      }

      setSuccessMessage(
        result.message ?? `ثبت نام شما در برنامه «${tripTitle}» با موفقیت انجام شد`,
      );
      reset();
      router.refresh();
    } catch {
      setServerError("ارتباط با سرور برقرار نشد");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          نام و نام خانوادگی
        </label>
        <input
          type="text"
          disabled={isDisabled}
          {...register("fullName")}
          className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:ring focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="مثال: علی محمدی"
        />
        {errors.fullName ? (
          <p className="mt-1 text-xs text-rose-300">{errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-300">کد ملی</label>
          <input
            type="text"
            inputMode="numeric"
            disabled={isDisabled}
            {...register("nationalId")}
            className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:ring focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="10 رقم"
          />
          {errors.nationalId ? (
            <p className="mt-1 text-xs text-rose-300">
              {errors.nationalId.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">شماره موبایل</label>
          <input
            type="text"
            inputMode="tel"
            disabled={isDisabled}
            {...register("phone")}
            className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:ring focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="09123456789"
          />
          {errors.phone ? (
            <p className="mt-1 text-xs text-rose-300">{errors.phone.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">
          شماره تماس اضطراری
        </label>
        <input
          type="text"
          inputMode="tel"
          disabled={isDisabled}
          {...register("emergencyPhone")}
          className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:ring focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="0912xxxxxxx"
        />
        {errors.emergencyPhone ? (
          <p className="mt-1 text-xs text-rose-300">
            {errors.emergencyPhone.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">
          توضیحات پزشکی (اختیاری)
        </label>
        <textarea
          rows={4}
          disabled={isDisabled}
          {...register("medicalNotes")}
          className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:ring focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="مثلا حساسیت دارویی، سابقه آسیب زانو و ..."
        />
        {errors.medicalNotes ? (
          <p className="mt-1 text-xs text-rose-300">
            {errors.medicalNotes.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          disabled={isDisabled}
          {...register("acceptRules")}
          className="mt-1"
        />
        <span>قوانین برنامه، مسئولیت فردی و شرایط انصراف را می پذیرم.</span>
      </label>
      {errors.acceptRules ? (
        <p className="text-xs text-rose-300">{errors.acceptRules.message}</p>
      ) : null}

      {serverError ? (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {serverError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isDisabled || isSubmitting}
        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "در حال ثبت..." : "ثبت نام در برنامه"}
      </button>
    </form>
  );
}
