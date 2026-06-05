import { NextRequest, NextResponse } from "next/server";
import { initializeIfEmpty, cleanupOldVersions, getBlobStatus } from "@/lib/adminPhotos";

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

// POST — initialize if empty + clean up old blob versions
// Safe to call at any time: does NOT overwrite existing photo data.
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const init    = await initializeIfEmpty();
    const cleanup = await cleanupOldVersions();
    return NextResponse.json({ success: true, ...init, cleaned: cleanup.deleted });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Sync failed", detail: String(err) }, { status: 500 });
  }
}
