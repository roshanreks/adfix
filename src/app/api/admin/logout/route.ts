import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}
