import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET || `admin-secret-roshan-adfix`
);

async function verifyAdminCookie(req: NextRequest): Promise<boolean> {
  const adminCookie = req.cookies.get("admin-session")?.value;
  if (!adminCookie) return false;
  try {
    const { payload } = await jwtVerify(adminCookie, ADMIN_SECRET, { clockTolerance: 60 });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const isOnboardingComplete = !!token?.onboardingComplete;

  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/api/") ||
    nextUrl.pathname === "/dashboard/login" ||
    nextUrl.pathname === "/onboarding" ||
    nextUrl.pathname === "/offline";

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = nextUrl.pathname === "/admin/login";

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Admin routes: check admin session cookie (separate from NextAuth)
  if (isAdminRoute) {
    if (isAdminLogin) {
      return NextResponse.next();
    }
    const isAdmin = await verifyAdminCookie(req);
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    return NextResponse.next();
  }

  // Require auth for dashboard
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard/login", nextUrl));
  }

  // Require onboarding for dashboard (but not login/onboarding pages)
  if (isDashboardRoute && isLoggedIn && !isOnboardingComplete) {
    if (nextUrl.pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
