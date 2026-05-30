import { NextRequest, NextResponse } from "next/server";
import { addPhoto } from "@/lib/adminPhotos";
import { Category, Photo } from "@/lib/photos";
import fs from "fs";
import path from "path";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

function authorized(req: NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const alt = formData.get("alt") as string;
  const category = formData.get("category") as Category;

  if (!file || !alt || !category) {
    return NextResponse.json({ error: "file, alt and category are required" }, { status: 400 });
  }

  const id = `upload_${Date.now()}`;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${id}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);

  const photo: Photo = {
    id,
    src: `/uploads/${filename}`,
    alt,
    category,
    width: 1200,
    height: 800,
  };

  const photos = addPhoto(photo);
  return NextResponse.json({ photo, photos }, { status: 201 });
}
