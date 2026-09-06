"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  reviewPayment,
  type ReviewPaymentResult,
} from "../../actions/admin/payments/review-payment";

type Props = {
  paymentId: string;
  method: string;
  status: string;
};

export function PaymentReviewActions({ paymentId, method, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [referenceId, setReferenceId] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  if (method !== "CARD_TRANSFER" || status !== "PENDING") {
    return (
      <p className="text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
        این ابزار فقط برای تراکنش‌های کارت‌به‌کارتِ در انتظار فعال می‌شود.
      </p>
    );
  }

  const handleDecision = (decision: "APPROVE" | "REJECT") => {
    setMessage(null);
    setMessageType(null);

    startTransition(async () => {
      const result: ReviewPaymentResult = await reviewPayment({
        paymentId,
        decision,
        referenceId: referenceId.trim() || null,
        note: note.trim() || null,
      });

      if (result.ok) {
        setMessage(result.message);
        setMessageType("success");
        router.refresh();
        return;
      }

      setMessage(result.message);
      setMessageType("error");
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-zinc-600 dark:text-zinc-400">
            کد رهگیری / مرجع
          </label>
          <input
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="اختیاری"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-zinc-600 dark:text-zinc-400">
            یادداشت ادمین
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="اختیاری"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={() => handleDecision("APPROVE")}
          disabled={isPending}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
        >
          {isPending ? "در حال بررسی..." : "تایید دستی کارت‌به‌کارت"}
        </button>

        <button
          type="button"
          onClick={() => handleDecision("REJECT")}
          disabled={isPending}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
        >
          {isPending ? "در حال بررسی..." : "رد تراکنش"}
        </button>
      </div>

      {message ? (
        <p
          className={`text-xs leading-5 ${
            messageType === "success"
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-red-700 dark:text-red-400"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
