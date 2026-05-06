import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const source = searchParams.get("source") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { whatsapp: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (source) where.source = source;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" } });

    // Build CSV manually for simplicity (no papaparse needed for export)
    const headers = [
      "ID", "Name", "Email", "Phone", "WhatsApp", "Company", "Website",
      "Niche", "Monthly Spend", "Role", "Challenge", "Source", "UTM Source",
      "UTM Medium", "UTM Campaign", "Onboarding Step", "Onboarding Complete",
      "Has Audit", "Audit Count", "Clicked Expert Audit", "Lead Score",
      "Priority", "Status", "Admin Notes", "Created At", "Updated At",
    ];

    const escapeCsv = (value: string | number | boolean | null | undefined) => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = leads.map((lead) => [
      lead.id,
      lead.name,
      lead.email,
      lead.phone,
      lead.whatsapp,
      lead.companyName,
      lead.website,
      lead.niche,
      lead.monthlySpend,
      lead.role,
      lead.challenge,
      lead.source,
      lead.utmSource,
      lead.utmMedium,
      lead.utmCampaign,
      lead.onboardingStep,
      lead.onboardingComplete ? "Yes" : "No",
      lead.hasAudit ? "Yes" : "No",
      lead.auditCount,
      lead.hasClickedExpertAudit ? "Yes" : "No",
      lead.leadScore,
      lead.priority,
      lead.status,
      lead.adminNotes,
      lead.createdAt.toISOString(),
      lead.updatedAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");

    const dateStr = new Date().toISOString().split("T")[0];
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads-${dateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export leads error:", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }
}
