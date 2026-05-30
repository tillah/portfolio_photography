import { NextRequest, NextResponse } from "next/server";
import { readPhotos, addPhoto } from "@/lib/adminPhotos";
import { Photo, Category } from "@/lib/photos";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

function authorized(req: NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(readPhotos());
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { src, alt, category } = body as { src: string; alt: string; category: Category };

  if (!src || !alt || !category) {
    return NextResponse.json({ error: "src, alt and category are required" }, { status: 400 });
  }

  const photo: Photo = {
    id: `photo_${Date.now()}`,
    src,
    alt,
    category,
    width: 1200,
    height: 800,
  };

  const photos = addPhoto(photo);
  return NextResponse.json({ photo, photos }, { status: 201 });
}
