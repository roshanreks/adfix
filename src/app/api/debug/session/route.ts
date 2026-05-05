import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: session.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        } : null,
      } : null,
      cookies: req.headers.get("cookie") ? "present" : "missing",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
