import { NextResponse } from "next/server";
import { listFiles } from "@/utils/cloudinary";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const prefix = url.searchParams.get("prefix") || "";
    const files = await listFiles(prefix);
    return NextResponse.json(files);
  } catch (err) {
    return NextResponse.json({ error: "List failed", details: err }, { status: 500 });
  }
}
