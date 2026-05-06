import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sendCapiLead } from "@/lib/meta-capi";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "adfix-salt-v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getUtmFromCookies(): Promise<{ source?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }> {
  try {
    const cookieStore = await cookies();
    const utmCookie = cookieStore.get("adfix_utm")?.value;
    if (utmCookie) {
      return JSON.parse(utmCookie);
    }
  } catch {
    // ignore
  }
  return {};
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, utmSource, utmMedium, utmCampaign, source } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        password: passwordHash,
        onboardingComplete: false,
      },
    });

    // Create lead record with UTM data
    const utm = await getUtmFromCookies();
    await prisma.lead.create({
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        source: source || utm.source || utm.utmSource || "organic",
        utmSource: utmSource || utm.utmSource || null,
        utmMedium: utmMedium || utm.utmMedium || null,
        utmCampaign: utmCampaign || utm.utmCampaign || null,
        onboardingStep: 0,
      },
    });

    // Send CAPI Lead event
    sendCapiLead({
      email: user.email,
      name: user.name || undefined,
      eventSourceUrl: "https://audit.theurbanmedia.in/dashboard/login",
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
