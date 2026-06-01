import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const info: Record<string, unknown> = {
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    blobTokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 20) + "...",
    nodeVersion: process.version,
  };

  // Test blob list
  try {
    const { list } = await import("@vercel/blob");
    const result = await list({ prefix: "data/" });
    info.blobListOk = true;
    info.blobCount = result.blobs.length;
    info.blobs = result.blobs.map(b => b.pathname);
  } catch (e) {
    info.blobListError = String(e);
  }

  // Test blob put
  try {
    const { put } = await import("@vercel/blob");
    const r = await put("data/debug-test.txt", "hello", { access: "public", addRandomSuffix: false });
    info.blobPutOk = true;
    info.blobPutUrl = r.url;
  } catch (e) {
    info.blobPutError = String(e);
  }

  return NextResponse.json(info);
}
