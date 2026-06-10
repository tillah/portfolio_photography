import { NextRequest, NextResponse } from "next/server";
import { readPhotos, addPhoto } from "@/lib/adminPhotos";
import { Photo, Category } from "@/lib/photos";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Fail loudly at startup if the env var is missing — never silently use a weak default
const ADMIN_PASSWORD = (() => {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD environment variable is not set");
  return pw;
})();

function authorized(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

/** Shared auth-route rate limit: 5 attempts per 15 minutes per IP */
function checkAuthRateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIp(req);
  const rl = rateLimit("admin-auth", ip, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }
  return null;
}

export async function GET(req: NextRequest) {
  const limited = checkAuthRateLimit(req);
  if (limited) return limited;

  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await readPhotos());
}

export async function POST(req: NextRequest) {
  const limited = checkAuthRateLimit(req);
  if (limited) return limited;

  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { src, alt, category } = body as { src: string; alt: string; category: Category };

  if (!src || !alt || !category) {
    return NextResponse.json({ error: "src, alt and category are required" }, { status: 400 });
  }

  // Sanitize text fields
  const safeAlt = String(alt).replace(/<[^>]*>/g, "").trim().slice(0, 300);

  const photo: Photo = {
    id: `photo_${Date.now()}`,
    src,
    alt: safeAlt,
    category,
    width: 1200,
    height: 800,
  };

  try {
    const photos = await addPhoto(photo);
    return NextResponse.json({ photo, photos }, { status: 201 });
  } catch (err) {
    console.error("addPhoto error:", err);
    return NextResponse.json({ error: "Failed to save photo record" }, { status: 500 });
  }
}
