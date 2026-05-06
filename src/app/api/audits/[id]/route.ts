import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in to view this audit." }, { status: 401 });
    }

    const { id } = await params;

    const audit = await prisma.audit.findFirst({
      where: { id, userId: user.id },
    });

    if (!audit) {
      return NextResponse.json({ error: "We could not find that audit report." }, { status: 404 });
    }

    return NextResponse.json({ audit });
  } catch (error) {
    console.error("Get audit error:", error);
    return NextResponse.json({ error: "We could not load this audit report. Please try again." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in to delete this audit." }, { status: 401 });
    }

    const { id } = await params;

    await prisma.audit.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete audit error:", error);
    return NextResponse.json({ error: "We could not delete this audit. Please try again." }, { status: 500 });
  }
}
