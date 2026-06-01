import { NextRequest, NextResponse } from "next/server";
import { removePhoto, updatePhoto } from "@/lib/adminPhotos";
import { Category } from "@/lib/photos";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

function authorized(req: NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const photos = await removePhoto(id);
  return NextResponse.json({ photos });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { alt, category } = await req.json() as { alt?: string; category?: Category };
  const photos = await updatePhoto(id, {
    ...(alt !== undefined && { alt }),
    ...(category !== undefined && { category }),
  });
  return NextResponse.json({ photos });
}
