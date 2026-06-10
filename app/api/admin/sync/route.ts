import { NextRequest, NextResponse } from "next/server";
import { initializeIfEmpty, getStoreStatus } from "@/lib/adminPhotos";
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

// GET — storage status
export async function GET(req: NextRequest) {
  const limited = checkAuthRateLimit(req);
  if (limited) return limited;

  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getStoreStatus());
}

// POST — initialize store if empty (safe: never overwrites existing data)
export async function POST(req: NextRequest) {
  const limited = checkAuthRateLimit(req);
  if (limited) return limited;

  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await initializeIfEmpty();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
