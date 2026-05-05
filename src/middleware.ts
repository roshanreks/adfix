import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isOnboardingComplete = !!req.auth?.user?.onboardingComplete;
  // const isAdmin = false; // checked at route level for admin

  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/api/") ||
    nextUrl.pathname === "/dashboard/login" ||
    nextUrl.pathname === "/onboarding" ||
    nextUrl.pathname === "/offline";

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Require auth for dashboard and admin
  if ((isDashboardRoute || isAdminRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard/login", nextUrl));
  }

  // Require onboarding for dashboard (but not login/onboarding pages)
  if (isDashboardRoute && isLoggedIn && !isOnboardingComplete) {
    // Don't redirect if already on a non-dashboard page
    if (nextUrl.pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
