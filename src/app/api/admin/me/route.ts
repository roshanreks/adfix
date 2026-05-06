import { NextResponse } from "next/server";
import { verifyAdminSession, COOKIE_NAME } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const authenticated = token ? await verifyAdminSession(token) : false;
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
