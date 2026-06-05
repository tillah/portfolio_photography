import { NextRequest, NextResponse } from "next/server";
import { syncFromLocal, getBlobStatus } from "@/lib/adminPhotos";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

function authorized(req: NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

// GET — check Blob status
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = await getBlobStatus();
  return NextResponse.json(status);
}

// POST — force-sync local data/photos.json → private Blob
// Resets the Blob store to the committed seed file.
// Use this to: initialize Blob for the first time, recover from corruption,
// or remove stale entries (like old categories or deleted image references).
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await syncFromLocal();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: "Sync failed", detail: String(err) },
      { status: 500 }
    );
  }
}
