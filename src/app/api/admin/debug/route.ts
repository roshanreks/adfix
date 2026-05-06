import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const adminCookie = req.cookies.get("admin-session")?.value;
  const isValid = adminCookie ? await verifyAdminSession(adminCookie) : false;

  return NextResponse.json({
    hasCookie: !!adminCookie,
    cookiePreview: adminCookie ? `${adminCookie.slice(0, 20)}...` : null,
    isValid,
    userAgent: req.headers.get("user-agent")?.slice(0, 50),
  });
}
