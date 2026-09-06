"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  tripRegistrationSchema,
  type TripRegistrationFormValues,
} from "@/lib/validators/trip-registration";

type TripRegistrationFormProps = {
  clubSlug: string;
  tripSlug: string;
  tripTitle: string;
  isDisabled?: boolean;
};

export function TripRegistrationForm({
  clubSlug,
  tripSlug,
  tripTitle,
  isDisabled = false,
}: TripRegistrationFormProps) {
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
  });

  async function onSubmit(values: TripRegistrationFormValues) {
    setSuccessMessage(null);
    setServerError(null);

    try {
      const response = await fetch(
        `/api/clubs/${clubSlug}/trips/${tripSlug}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.message ?? "ثبت‌نام با خطا مواجه شد.");
        return;
      }

      setSuccessMessage(`ثبت‌نام شما در برنامه «${tripTitle}» با موفقیت انجام شد.`);
      reset();
      router.refresh();
    } catch {
      setServerError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {successMessage ? (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/50 p-4 text-sm text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      {serverError ? (
        <div className="rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-rose-300">
          {serverError}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-300">
          نام و نام خانوادگی
        </label>
        <input
          id="fullName"
          type="text"
          {...register("fullName")}
          disabled={isDisabled || isSubmitting}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {errors.fullName ? (
          <p className="text-sm text-rose-400">{errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="nationalId" className="block text-sm font-medium text-slate-300">
          کد ملی
        </label>
        <input
          id="nationalId"
          type="text"
          inputMode="numeric"
          {...register("nationalId")}
          disabled={isDisabled || isSubmitting}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {errors.nationalId ? (
          <p className="text-sm text-rose-400">{errors.nationalId.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
          شماره تماس
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          {...register("phone")}
          disabled={isDisabled || isSubmitting}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {errors.phone ? (
          <p className="text-sm text-rose-400">{errors.phone.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="emergencyPhone"
          className="block text-sm font-medium text-slate-300"
        >
          شماره تماس اضطراری
        </label>
        <input
          id="emergencyPhone"
          type="tel"
          inputMode="tel"
          {...register("emergencyPhone")}
          disabled={isDisabled || isSubmitting}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {errors.emergencyPhone ? (
          <p className="text-sm text-rose-400">{errors.emergencyPhone.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="medicalNotes"
          className="block text-sm font-medium text-slate-300"
        >
          توضیحات پزشکی
        </label>
        <textarea
          id="medicalNotes"
          rows={4}
          {...register("medicalNotes")}
          disabled={isDisabled || isSubmitting}
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {errors.medicalNotes ? (
          <p className="text-sm text-rose-400">{errors.medicalNotes.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
          <input
            type="checkbox"
            {...register("acceptRules")}
            disabled={isDisabled || isSubmitting}
            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900"
          />
          <span>قوانین برنامه و مسئولیت صحت اطلاعات واردشده را می‌پذیرم.</span>
        </label>
        {errors.acceptRules ? (
          <p className="text-sm text-rose-400">{errors.acceptRules.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isDisabled || isSubmitting}
        className={`w-full rounded-xl p-4 font-bold transition-all ${
          isDisabled || isSubmitting
            ? "cursor-not-allowed bg-slate-700 text-slate-400"
            : "bg-cyan-600 text-white hover:bg-cyan-500"
        }`}
      >
        {isSubmitting ? "در حال ثبت اطلاعات..." : "ثبت‌نام در برنامه"}
      </button>
    </form>
  );
}
