import { NextRequest, NextResponse } from "next/server";
import { addPhoto } from "@/lib/adminPhotos";
import { Category, Photo } from "@/lib/photos";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const ADMIN_PASSWORD = (() => {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD environment variable is not set");
  return pw;
})();

function authorized(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

function checkAuthRateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIp(req);
  // Upload-specific limit: 20 uploads per 15 minutes per IP
  const rl = rateLimit("admin-upload", ip, 20, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }
  return null;
}

// Allowed MIME types and their magic bytes (first N bytes of file)
const ALLOWED_TYPES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png":  [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF....WEBP
  "image/gif":  [[0x47, 0x49, 0x46, 0x38]],  // GIF8
};

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Verify the file's actual content matches an allowed image type.
 * Client-supplied MIME types are untrusted; we check the magic bytes ourselves.
 */
function validateMagicBytes(buffer: Buffer, claimedType: string): boolean {
  const signatures = ALLOWED_TYPES[claimedType];
  if (!signatures) return false;

  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

function cloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

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
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });

  return {
    src:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
  };
}

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
  // Rate limit first (before auth check — cheaper)
  const limited = checkAuthRateLimit(req);
  if (limited) return limited;

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

  // ── File size check ──────────────────────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 20 MB." },
      { status: 413 }
    );
  }

  // ── Read buffer for magic-bytes check ────────────────────────────────────────
  const buffer = Buffer.from(await file.arrayBuffer());

  // ── MIME type check (client-claimed type + magic bytes) ──────────────────────
  const claimedType = file.type;
  if (!Object.keys(ALLOWED_TYPES).includes(claimedType)) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF." },
      { status: 415 }
    );
  }
  if (!validateMagicBytes(buffer, claimedType)) {
    return NextResponse.json(
      { error: "File content does not match its declared type." },
      { status: 415 }
    );
  }

  // ── Sanitize alt text ────────────────────────────────────────────────────────
  const safeAlt = String(alt).replace(/<[^>]*>/g, "").trim().slice(0, 300);

  const id = `upload_${Date.now()}`;
  let photoAsset: { src: string; publicId?: string; width: number; height: number };

  if (cloudinaryConfigured()) {
    try {
      const result = await uploadToCloudinary(buffer, claimedType, id);
      photoAsset = result;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
    }
  } else {
    try {
      const result = await uploadToBlob(file, id);
      photoAsset = result;
    } catch (err) {
      console.error("Blob upload error:", err);
      return NextResponse.json(
        { error: "Image upload failed. Configure CLOUDINARY_* env vars for best results." },
        { status: 500 }
      );
    }
  }

  const photo: Photo = {
    id,
    src:      photoAsset.src,
    alt:      safeAlt,
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
    return NextResponse.json({ error: "Failed to save photo record" }, { status: 500 });
  }
}
