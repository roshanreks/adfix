import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if emailVerified column exists
    const check = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'emailVerified'
    `;
    
    if (Array.isArray(check) && check.length > 0) {
      return NextResponse.json({ ok: true, message: "emailVerified column already exists" });
    }
    
    // Add the column
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMP(3)`);
    
    return NextResponse.json({ ok: true, message: "emailVerified column added successfully" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
