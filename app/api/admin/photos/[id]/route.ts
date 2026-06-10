import { NextRequest, NextResponse } from "next/server";
import { removePhoto, updatePhoto } from "@/lib/adminPhotos";
import { Category } from "@/lib/photos";
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
  const rl = rateLimit("admin-auth", ip, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }
  return null;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = checkAuthRateLimit(req);
  if (limited) return limited;

  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const photos = await removePhoto(id);
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("removePhoto error:", err);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = checkAuthRateLimit(req);
  if (limited) return limited;

  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    alt?:       string;
    category?:  Category;
    featured?:  boolean;
    published?: boolean;
  };

  // Sanitize alt text if provided
  const safeAlt = body.alt !== undefined
    ? String(body.alt).replace(/<[^>]*>/g, "").trim().slice(0, 300)
    : undefined;

  try {
    const photos = await updatePhoto(id, {
      ...(safeAlt      !== undefined && { alt:       safeAlt }),
      ...(body.category  !== undefined && { category:  body.category }),
      ...(body.featured  !== undefined && { featured:  body.featured }),
      ...(body.published !== undefined && { published: body.published }),
    });
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("updatePhoto error:", err);
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
  }
}
