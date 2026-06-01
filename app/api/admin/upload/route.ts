import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { addPhoto } from "@/lib/adminPhotos";
import { Category, Photo } from "@/lib/photos";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

function authorized(req: NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const alt = formData.get("alt") as string;
  const category = formData.get("category") as Category;

  if (!file || !alt || !category)
    return NextResponse.json(
      { error: "file, alt and category are required" },
      { status: 400 }
    );

  const id = `upload_${Date.now()}`;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `photos/${id}.${ext}`;

  // Upload image to Vercel Blob
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  const photo: Photo = {
    id,
    src: blob.url,
    alt,
    category,
    width: 1200,
    height: 800,
  };

  const photos = await addPhoto(photo);
  return NextResponse.json({ photo, photos }, { status: 201 });
}
