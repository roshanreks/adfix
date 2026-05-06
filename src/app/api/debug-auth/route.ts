import { NextResponse } from "next/server";

export async function GET() {
  const authSecret = process.env.AUTH_SECRET ? "SET" : "EMPTY";
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? "SET" : "EMPTY";
  const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "NOT SET";
  const googleClientId = process.env.GOOGLE_CLIENT_ID ? "SET" : "EMPTY";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? "SET" : "EMPTY";
  
  return NextResponse.json({
    authSecret,
    nextAuthSecret,
    nextAuthUrl,
    googleClientId,
    googleClientSecret,
    nodeEnv: process.env.NODE_ENV,
  });
}