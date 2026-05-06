import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "adfix-salt-v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  basePath: "/api/auth",
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/dashboard/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const passwordHash = await hashPassword(String(credentials.password));
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        if (user.password !== passwordHash) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          onboardingComplete: user.onboardingComplete,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "signIn" && user) {
        token.userId = user.id as string;
        token.onboardingComplete = (user.onboardingComplete as boolean) ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user.id = token.userId as string;
        // Refresh onboarding status from DB so changes are picked up immediately
        // without requiring the user to sign in again
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.userId as string },
            select: { onboardingComplete: true, name: true, email: true, image: true },
          });
          if (dbUser) {
            session.user.onboardingComplete = dbUser.onboardingComplete;
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            session.user.image = dbUser.image;
          }
        } catch {
          // Fallback to token value if DB is unavailable
          if (token?.onboardingComplete !== undefined) {
            session.user.onboardingComplete = token.onboardingComplete as boolean;
          }
        }
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser && account?.provider === "google") {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && user.email === adminEmail) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true },
          });
        }
      }
    },
  },
});
