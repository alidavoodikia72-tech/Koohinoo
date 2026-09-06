"use server";

import { Prisma } from "@prisma/client";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

const reviewPaymentSchema = z.object({
  paymentId: z.string().min(1, "شناسه پرداخت الزامی است."),
  decision: z.enum(["APPROVE", "REJECT"]),
  referenceId: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export type ReviewPaymentInput = z.infer<typeof reviewPaymentSchema>;

export type ReviewPaymentResult =
  | {
      ok: true;
      message: string;
      paymentStatus: "SUCCESS" | "FAILED";
      bookingStatus: "CONFIRMED" | "CANCELLED";
    }
  | {
      ok: false;
      code:
        | "UNAUTHORIZED"
        | "FORBIDDEN"
        | "INVALID_INPUT"
        | "PAYMENT_NOT_FOUND"
        | "ALREADY_PROCESSED"
        | "INVALID_METHOD"
        | "CAPACITY_FULL"
        | "INTERNAL_ERROR";
      message: string;
    };

export async function reviewPayment(
  input: ReviewPaymentInput
): Promise<ReviewPaymentResult> {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        message: "برای انجام این عملیات باید وارد حساب کاربری شوید.",
      };
    }

    if (user.role !== "ADMIN") {
      return {
        ok: false,
        code: "FORBIDDEN",
        message: "شما مجوز انجام این عملیات را ندارید.",
      };
    }

    const parsed = reviewPaymentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است.",
      };
    }

    const { paymentId, decision, referenceId, note } = parsed.data;

    const result = await prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { id: paymentId },
          include: {
            booking: {
              include: {
                trip: true,
              },
            },
          },
        });

        if (!payment) {
          return {
            ok: false as const,
            code: "PAYMENT_NOT_FOUND" as const,
            message: "تراکنش موردنظر پیدا نشد.",
          };
        }

        if (payment.status !== "PENDING") {
          return {
            ok: false as const,
            code: "ALREADY_PROCESSED" as const,
            message: "این تراکنش قبلاً بررسی شده است.",
          };
        }

        if (payment.method !== "CARD_TRANSFER") {
          return {
            ok: false as const,
            code: "INVALID_METHOD" as const,
            message: "این عملیات فقط برای پرداخت‌های کارت‌به‌کارت قابل انجام است.",
          };
        }

        const booking = payment.booking;
        const trip = booking.trip;

        if (decision === "REJECT") {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "FAILED",
              referenceId: referenceId ?? payment.referenceId,
            },
          });

          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: "CANCELLED",
            },
          });

          return {
            ok: true as const,
            message: "تراکنش رد شد و رزرو لغو گردید.",
            paymentStatus: "FAILED" as const,
            bookingStatus: "CANCELLED" as const,
          };
        }

        // APPROVE
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
        const remainingCapacity = (trip.capacity ?? 0) - usedCapacity;

        if (remainingCapacity < booking.participantCount) {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "FAILED",
              referenceId: referenceId ?? payment.referenceId,
            },
          });

          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: "CANCELLED",
            },
          });

          return {
            ok: false as const,
            code: "CAPACITY_FULL" as const,
            message: "ظرفیت برنامه تکمیل شده و امکان تأیید این رزرو وجود ندارد.",
          };
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            referenceId: referenceId ?? payment.referenceId,
            gateway: payment.gateway ?? "manual-card-transfer",
          },
        });

        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: "CONFIRMED",
          },
        });

        return {
          ok: true as const,
          message: note
            ? `تراکنش تأیید شد. یادداشت: ${note}`
            : "تراکنش با موفقیت تأیید شد و رزرو قطعی گردید.",
          paymentStatus: "SUCCESS" as const,
          bookingStatus: "CONFIRMED" as const,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return result;
  } catch (error) {
    console.error("reviewPayment error:", error);
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: "خطای داخلی سرور رخ داد.",
    };
  }
}
