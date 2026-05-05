import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";

export async function GET() {
  try {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const prismaCli = path.join(process.cwd(), "node_modules", "prisma", "build", "index.js");
    const result = execSync(
      `node "${prismaCli}" db push --schema="${schemaPath}" --accept-data-loss`,
      { encoding: "utf-8", timeout: 30000, env: process.env }
    );
    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      error: error.message,
      stderr: error.stderr?.toString(),
      stdout: error.stdout?.toString()
    }, { status: 500 });
  }
}
