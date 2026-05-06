import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSessionUser } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploaded = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds 5MB limit` }, { status: 400 });
      }

      const blob = await put(`adfix/${user.id}/${Date.now()}-${file.name}`, file, {
        access: "public",
      });

      uploaded.push({
        name: file.name,
        url: blob.url,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ files: uploaded });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}
