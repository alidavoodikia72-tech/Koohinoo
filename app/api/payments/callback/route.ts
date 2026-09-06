import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { confirmPayment } from "../../../../actions/payment/confirm-payment";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const paymentId =
    url.searchParams.get("paymentId") ||
    url.searchParams.get("payment_id") ||
    "";

  const status =
    url.searchParams.get("Status") ||
    url.searchParams.get("status") ||
    "";

  const authority =
    url.searchParams.get("Authority") ||
    url.searchParams.get("authority") ||
    "";

  const refId =
    url.searchParams.get("RefID") ||
    url.searchParams.get("refId") ||
    url.searchParams.get("ref_id") ||
    "";

  if (!paymentId) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_STATE",
        message: "paymentId is required.",
      },
      { status: 400 }
    );
  }

  // Gateway reported success
  if (status.toUpperCase() === "OK") {
    const result = await confirmPayment({
      paymentId,
      referenceId: refId || authority || undefined,
      gateway: "zarinpal",
    });

    const httpStatus = result.ok ? 200 : 400;
    return NextResponse.json(result, { status: httpStatus });
  }

  // Gateway reported failure / cancelled payment
  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { booking: true },
      });

      if (!payment) return;

      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
          referenceId: refId || authority || payment.referenceId,
          gateway: "zarinpal",
        },
      });

      if (payment.booking && payment.booking.status === "PENDING") {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CANCELLED" },
        });
      }
    });

    return NextResponse.json(
      {
        ok: false,
        code: "PAYMENT_FAILED",
        message: "Payment was not approved by the gateway.",
      },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Failed to process payment callback.",
      },
      { status: 500 }
    );
  }
}
