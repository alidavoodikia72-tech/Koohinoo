"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

const confirmPaymentSchema = z.object({
  paymentId: z.string().min(1, "paymentId is required"),
  referenceId: z.string().min(1).optional(),
  gateway: z.string().min(1).optional(),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;

export type ConfirmPaymentResult =
  | {
      ok: true;
      code: "CONFIRMED";
      bookingId: string;
      paymentId: string;
      tripId: string;
      amount: number;
      participantCount: number;
    }
  | {
      ok: true;
      code: "ALREADY_CONFIRMED";
      bookingId: string;
      paymentId: string;
    }
  | {
      ok: false;
      code:
        | "NOT_FOUND"
        | "INVALID_STATE"
        | "AMOUNT_MISMATCH"
        | "CAPACITY_FULL"
        | "INTERNAL_ERROR";
      message: string;
    };

export async function confirmPayment(
  input: ConfirmPaymentInput
): Promise<ConfirmPaymentResult> {
  const parsed = confirmPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_STATE",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.findUnique({
          where: {
            id: parsed.data.paymentId,
          },
          include: {
            booking: {
              include: {
                trip: true,
              },
            },
          },
        });

        if (!payment || !payment.booking || !payment.booking.trip) {
          return {
            ok: false,
            code: "NOT_FOUND",
            message: "Payment or related booking was not found.",
          } satisfies ConfirmPaymentResult;
        }

        const booking = payment.booking;
        const trip = booking.trip;

        if (payment.status === "SUCCESS" && booking.status === "CONFIRMED") {
          return {
            ok: true,
            code: "ALREADY_CONFIRMED",
            bookingId: booking.id,
            paymentId: payment.id,
          } satisfies ConfirmPaymentResult;
        }

        if (booking.status === "CANCELLED" || booking.status === "REFUNDED") {
          return {
            ok: false,
            code: "INVALID_STATE",
            message: "Booking is not available for confirmation.",
          } satisfies ConfirmPaymentResult;
        }

        if (payment.status === "SUCCESS" && booking.status !== "CONFIRMED") {
          return {
            ok: false,
            code: "INVALID_STATE",
            message: "Payment is already successful but booking is not confirmed.",
          } satisfies ConfirmPaymentResult;
        }

        if (payment.amount !== booking.totalPrice) {
          return {
            ok: false,
            code: "AMOUNT_MISMATCH",
            message: "Payment amount does not match booking total price.",
          } satisfies ConfirmPaymentResult;
        }

        const confirmedSeats = await tx.booking.aggregate({
          where: {
            tripId: trip.id,
            status: "CONFIRMED",
          },
          _sum: {
            participantCount: true,
          },
        });

        const usedSeats = confirmedSeats._sum.participantCount ?? 0;
        const requestedSeats = booking.participantCount;
        const capacity = trip.capacity ?? 0;

        if (usedSeats + requestedSeats > capacity) {
          await tx.payment.update({
            where: {
              id: payment.id,
            },
            data: {
              status: "FAILED",
              referenceId: parsed.data.referenceId ?? payment.referenceId,
              gateway: parsed.data.gateway ?? payment.gateway,
            },
          });

          await tx.booking.update({
            where: {
              id: booking.id,
            },
            data: {
              status: "CANCELLED",
            },
          });

          return {
            ok: false,
            code: "CAPACITY_FULL",
            message:
              "Trip capacity is full. Booking was cancelled and payment marked failed.",
          } satisfies ConfirmPaymentResult;
        }

        await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "SUCCESS",
            referenceId: parsed.data.referenceId ?? payment.referenceId,
            gateway: parsed.data.gateway ?? payment.gateway ?? "zarinpal",
          },
        });

        await tx.booking.update({
          where: {
            id: booking.id,
          },
          data: {
            status: "CONFIRMED",
          },
        });

        return {
          ok: true,
          code: "CONFIRMED",
          bookingId: booking.id,
          paymentId: payment.id,
          tripId: trip.id,
          amount: payment.amount,
          participantCount: booking.participantCount,
        } satisfies ConfirmPaymentResult;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch {
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred while confirming payment.",
    };
  }
}
