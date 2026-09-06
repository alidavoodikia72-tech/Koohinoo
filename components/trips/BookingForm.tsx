"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "../../actions/booking/create-booking";

interface BookingFormProps {
  tripId: string;
  price: number;
  capacity: number;
  remainingSeats: number;
}

export default function BookingForm({
  tripId,
  price,
  capacity,
  remainingSeats,
}: BookingFormProps) {
  const [participantCount, setParticipantCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await createBooking({
        tripId,
        participantCount,
      });

      if (!result.ok) {
        if (result.code === "UNAUTHORIZED") {
          router.push("/login");
          return;
        }
        setError(result.message);
        return;
      }

      alert(`رزرو با موفقیت ایجاد شد. مبلغ: ${result.amount.toLocaleString()} تومان`);
      
      // هدایت کاربر به کال‌بک جهت تأیید و تست نهایی فرآیند
      router.push(`/api/payments/callback?paymentId=${result.paymentId}&status=OK`);
      
    } catch (err) {
      setError("خطایی در برقراری ارتباط رخ داد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-right" dir="rtl">
      <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-50">ثبت‌نام در این برنامه</h3>
      
      <div className="flex justify-between mb-4 text-sm">
        <span className="text-zinc-500">قیمت هر نفر:</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {price.toLocaleString()} تومان
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <label className="text-sm text-zinc-500">تعداد نفرات:</label>
        <div className="flex items-center gap-3" dir="ltr">
          <button
            type="button"
            onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
            className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            -
          </button>
          <span className="w-5 text-center font-bold text-zinc-800 dark:text-zinc-200">
            {participantCount}
          </span>
          <button
            type="button"
            onClick={() => setParticipantCount(Math.min(remainingSeats, participantCount + 1))}
            className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            +
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleBooking}
        disabled={loading || remainingSeats <= 0}
        className={`w-full py-3 rounded-lg font-bold transition-all ${
          remainingSeats <= 0
            ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
        }`}
      >
        {loading ? "در حال پردازش..." : remainingSeats <= 0 ? "ظرفیت تکمیل" : "تایید و پرداخت"}
      </button>

      <p className="mt-4 text-[10px] text-zinc-400 text-center">
        با کلیک بر روی دکمه بالا، با قوانین و مقررات صعود موافقت می‌کنید.
      </p>
    </div>
  );
}
