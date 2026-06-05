import { NextRequest, NextResponse } from "next/server";
import { addPhoto } from "@/lib/adminPhotos";
import { Category, Photo } from "@/lib/photos";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

function authorized(req: NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

function cloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Upload to Cloudinary — returns src URL, publicId, and real dimensions
async function uploadToCloudinary(
  buffer: Buffer,
  fileType: string,
  publicId: string
): Promise<{ src: string; publicId: string; width: number; height: number }> {
  const { v2: cloudinary } = await import("cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });

  const base64  = buffer.toString("base64");
  const dataUri = `data:${fileType};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder:        "tehillah-photography",
    public_id:     publicId,
    overwrite:     false,
    resource_type: "image",
    // Automatic format and quality optimisation on delivery
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });

  return {
    src:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
  };
}

// Fallback: upload to Vercel Blob
async function uploadToBlob(
  file: File,
  id: string
): Promise<{ src: string; width: number; height: number }> {
  const { put } = await import("@vercel/blob");
  const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `photos/${id}.${ext}`;

  const blob = await put(filename, file, {
    access:          "public",
    addRandomSuffix: false,
    allowOverwrite:  true,
  });

  return { src: blob.url, width: 1200, height: 800 };
}

export async function POST(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file     = formData.get("file") as File | null;
  const alt      = formData.get("alt") as string;
  const category = formData.get("category") as Category;

  if (!file || !alt || !category)
    return NextResponse.json(
      { error: "file, alt and category are required" },
      { status: 400 }
    );

  const id = `upload_${Date.now()}`;
  let photoAsset: { src: string; publicId?: string; width: number; height: number };

  if (cloudinaryConfigured()) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, file.type, id);
      photoAsset = result;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return NextResponse.json(
        { error: "Image upload failed", detail: String(err) },
        { status: 500 }
      );
    }
  } else {
    // Cloudinary not configured — fall back to Vercel Blob
    try {
      const result = await uploadToBlob(file, id);
      photoAsset = result;
    } catch (err) {
      console.error("Blob upload error:", err);
      return NextResponse.json(
        { error: "Image upload failed. Configure CLOUDINARY_* env vars for best results.", detail: String(err) },
        { status: 500 }
      );
    }
  }

  const photo: Photo = {
    id,
    src:      photoAsset.src,
    alt,
    category,
    width:    photoAsset.width,
    height:   photoAsset.height,
    ...(photoAsset.publicId && { publicId: photoAsset.publicId }),
    published: true,
    featured:  false,
  };

  try {
    const photos = await addPhoto(photo);
    return NextResponse.json({ photo, photos }, { status: 201 });
  } catch (err) {
    console.error("addPhoto error:", err);
    return NextResponse.json(
      { error: "Failed to save photo record", detail: String(err) },
      { status: 500 }
    );
  }
}
