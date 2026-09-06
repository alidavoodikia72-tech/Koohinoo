"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { auth } from "../../auth";

export type CreateBookingInput = {
  tripId: string;
  participantCount: number;
  paymentMethod?: "ONLINE" | "CARD_TRANSFER" | "WALLET";
};

export type CreateBookingResult =
  | {
      ok: true;
      message: string;
      bookingId: string;
      paymentId: string;
      amount: number;
      bookingStatus: "PENDING";
      paymentStatus: "PENDING";
    }
  | {
      ok: false;
      message: string;
      code:
        | "UNAUTHORIZED"
        | "INVALID_INPUT"
        | "TRIP_NOT_FOUND"
        | "TRIP_NOT_BOOKABLE"
        | "CAPACITY_FULL"
        | "INTERNAL_ERROR";
    };

function toInt(value: number) {
  return Math.trunc(value);
}

export async function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        message: "برای ثبت‌نام باید وارد حساب کاربری شوید.",
      };
    }

    if (!input?.tripId || typeof input.tripId !== "string") {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "شناسه برنامه نامعتبر است.",
      };
    }

    const participantCount = toInt(input.participantCount);
    if (!Number.isFinite(participantCount) || participantCount < 1) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: "تعداد شرکت‌کنندگان باید حداقل ۱ نفر باشد.",
      };
    }

    const method = input.paymentMethod ?? "ONLINE";

    const result = await prisma.$transaction(
      async (tx) => {
        const trip = await tx.trip.findUnique({
          where: { id: input.tripId },
          select: {
            id: true,
            title: true,
            price: true,
            capacity: true,
            status: true,
          },
        });

        if (!trip) {
          return {
            ok: false as const,
            code: "TRIP_NOT_FOUND" as const,
            message: "برنامه موردنظر پیدا نشد.",
          };
        }

        if (trip.status !== "PUBLISHED") {
          return {
            ok: false as const,
            code: "TRIP_NOT_BOOKABLE" as const,
            message: "این برنامه در حال حاضر قابل رزرو نیست.",
          };
        }

        const confirmedAgg = await tx.booking.aggregate({
          where: {
            tripId: trip.id,
            status: "CONFIRMED",
          },
          _sum: {
            participantCount: true,
          },
        });

        const usedCapacity = confirmedAgg._sum.participantCount ?? 0;
        const remaining = (trip.capacity ?? 0) - usedCapacity;

        if (remaining < participantCount) {
          return {
            ok: false as const,
            code: "CAPACITY_FULL" as const,
            message: `ظرفیت کافی نیست. ظرفیت باقی‌مانده: ${Math.max(
              0,
              remaining
            )} نفر.`,
          };
        }

        const totalPrice = trip.price * participantCount;

        const booking = await tx.booking.create({
          data: {
            tripId: trip.id,
            userId,
            participantCount,
            totalPrice,
            status: "PENDING",
          },
          select: {
            id: true,
            totalPrice: true,
            status: true,
          },
        });

        const payment = await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: booking.totalPrice,
            method,
            status: "PENDING",
            gateway: method === "ONLINE" ? "zarinpal" : null,
          },
          select: {
            id: true,
            status: true,
          },
        });

        return {
          ok: true as const,
          message: "رزرو با موفقیت ایجاد شد و پرداخت در حالت انتظار ثبت شد.",
          bookingId: booking.id,
          paymentId: payment.id,
          amount: booking.totalPrice,
          bookingStatus: "PENDING" as const,
          paymentStatus: "PENDING" as const,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return result;
  } catch (error) {
    console.error("createBookingAction error:", error);
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: "خطای داخلی سرور رخ داد. لطفاً دوباره تلاش کنید.",
    };
  }
}
