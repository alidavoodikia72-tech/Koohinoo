import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Trip id is required" }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as
      | { confirmTitle?: string }
      | null;

    const confirmTitle = body?.confirmTitle?.trim();
    if (!confirmTitle) {
      return NextResponse.json(
        { error: "عنوان تایید حذف ارسال نشده است" },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        clubId: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isSuperAdmin) {
      if (!session.user.clubId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (trip.clubId !== session.user.clubId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (confirmTitle !== trip.title.trim()) {
      return NextResponse.json(
        { error: "عنوان برنامه برای تایید حذف مطابقت ندارد" },
        { status: 400 }
      );
    }

    await prisma.trip.delete({
      where: { id },
    });

    revalidatePath("/dashboard/trips");
    revalidatePath(`/dashboard/trips/${id}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
