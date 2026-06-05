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
  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const photos = await removePhoto(id);
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("removePhoto error:", err);
    return NextResponse.json(
      { error: "Failed to delete photo", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    alt?:       string;
    category?:  Category;
    featured?:  boolean;
    published?: boolean;
  };

  try {
    const photos = await updatePhoto(id, {
      ...(body.alt       !== undefined && { alt:       body.alt }),
      ...(body.category  !== undefined && { category:  body.category }),
      ...(body.featured  !== undefined && { featured:  body.featured }),
      ...(body.published !== undefined && { published: body.published }),
    });
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("updatePhoto error:", err);
    return NextResponse.json(
      { error: "Failed to update photo", detail: String(err) },
      { status: 500 }
    );
  }
}
