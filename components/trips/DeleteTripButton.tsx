"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DeleteTripButtonProps = {
  tripId: string;
  tripTitle: string;
};

export default function DeleteTripButton({
  tripId,
  tripTitle,
}: DeleteTripButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isValid = useMemo(
    () => confirmText.trim() === tripTitle.trim(),
    [confirmText, tripTitle]
  );

  function resetAndClose() {
    setOpen(false);
    setConfirmText("");
    setError(null);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        resetAndClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function handleDelete() {
    if (!isValid || isPending) return;

    setError(null);

    try {
      const res = await fetch(`/dashboard/trips/${tripId}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmTitle: confirmText.trim(),
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        throw new Error(data?.error || "حذف برنامه انجام نشد");
      }

      resetAndClose();
      router.push("/dashboard/trips");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        حذف
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              resetAndClose();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-trip-title"
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl"
          >
            <h3 id="delete-trip-title" className="text-lg font-bold text-rose-300">
              تایید حذف برنامه
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              برای حذف این برنامه، عنوان آن را دقیقاً تایپ کنید:
            </p>

            <div className="mt-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100">
              {tripTitle}
            </div>

            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="عنوان برنامه را وارد کنید"
              className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            />

            {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={!isValid || isPending}
                onClick={() => startTransition(() => void handleDelete())}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "در حال حذف..." : "تایید حذف"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
