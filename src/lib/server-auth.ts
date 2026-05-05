import { auth } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function getSessionUser(req: NextRequest) {
  const session = await auth();
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      onboardingComplete: session.user.onboardingComplete as boolean | undefined,
    };
  }

  // Fallback: JWT token extraction when auth() fails on Vercel
  try {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    });
    if (token?.userId) {
      return {
        id: token.userId as string,
        email: (token.email as string) || "",
        name: (token.name as string) || "",
        image: (token.picture as string) || undefined,
        onboardingComplete: token.onboardingComplete as boolean | undefined,
      };
    }
  } catch {
    // ignore fallback errors
  }

  return null;
}
