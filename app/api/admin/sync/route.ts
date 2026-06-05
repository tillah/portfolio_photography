import { NextRequest, NextResponse } from "next/server";
import { initializeIfEmpty, getStoreStatus } from "@/lib/adminPhotos";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

function authorized(req: NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

// GET — storage status
export async function GET(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getStoreStatus());
}

// POST — initialize store if empty (safe: never overwrites existing data)
export async function POST(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await initializeIfEmpty();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: "Sync failed", detail: String(err) },
      { status: 500 }
    );
  }
}
