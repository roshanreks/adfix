import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const audits = await prisma.audit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ audits });
  } catch (error) {
    console.error("Get audits error:", error);
    return NextResponse.json({ error: "Failed to fetch audits" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, reportJson, csvUrl, healthScore, wastePercentage } = body;

    const audit = await prisma.audit.create({
      data: {
        userId: session.user.id,
        name: name || "Untitled Audit",
        reportJson: JSON.stringify(reportJson),
        csvUrl: csvUrl || null,
        healthScore: healthScore || 0,
        wastePercentage: wastePercentage || 0,
      },
    });

    return NextResponse.json({ audit }, { status: 201 });
  } catch (error) {
    console.error("Create audit error:", error);
    return NextResponse.json({ error: "Failed to create audit" }, { status: 500 });
  }
}
