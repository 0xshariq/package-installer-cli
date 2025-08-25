import { NextResponse } from "next/server";
import { deleteFile } from "../../../../services/cloudinaryService";

export async function POST(request) {
  try {
    const { publicId } = await request.json();
    const data = await deleteFile(publicId);
    return NextResponse.json({ message: "Deleted successfully", data });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed", details: err }, { status: 500 });
  }
}
