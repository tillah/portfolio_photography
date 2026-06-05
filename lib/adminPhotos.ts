/**
 * adminPhotos.ts — photo metadata storage
 *
 * Storage hierarchy (first available wins):
 *   1. Vercel KV   — primary, always fresh, no CDN issues (requires KV env vars)
 *   2. Vercel Blob — versioned JSON fallback (legacy, used until KV is set up)
 *   3. Local file  — data/photos.json — last resort / seed
 */

import { Photo } from "./photos";

const KV_KEY         = "photos";
const VERSION_PREFIX = "data/photos_v";
const LEGACY_PATH    = "data/photos.json";

// ── KV availability ───────────────────────────────────────────────────────────
function kvAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// ── Read ──────────────────────────────────────────────────────────────────────
export async function readPhotos(): Promise<Photo[]> {
  // 1. Vercel KV — single fast lookup, always fresh
  if (kvAvailable()) {
    try {
      const { kv } = await import("@vercel/kv");
      const data = await kv.get<Photo[]>(KV_KEY);
      if (Array.isArray(data)) return data;
    } catch { /* fall through */ }
  }

  // 2. Versioned Blob — pick newest by uploadedAt
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: VERSION_PREFIX });
    if (blobs.length > 0) {
      const latest = blobs.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )[0];
      const res = await fetch(latest.url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    }
  } catch { /* fall through */ }

  // 3. Legacy fixed-path Blob (migration source only)
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: LEGACY_PATH });
    if (blobs.length > 0) {
      const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    }
  } catch { /* fall through */ }

  // 4. Local committed file
  try {
    const fs   = await import("fs");
    const path = await import("path");
    const local = path.join(process.cwd(), "data", "photos.json");
    if (fs.existsSync(local)) return JSON.parse(fs.readFileSync(local, "utf-8"));
  } catch { /* ignore */ }

  return [];
}

// ── Write ─────────────────────────────────────────────────────────────────────
export async function writePhotos(photos: Photo[]): Promise<void> {
  // 1. KV — preferred (atomic, no CDN)
  if (kvAvailable()) {
    const { kv } = await import("@vercel/kv");
    await kv.set(KV_KEY, photos);
    return;
  }

  // 2. Versioned Blob fallback (new URL each time = never CDN-cached)
  const { put } = await import("@vercel/blob");
  const versionPath = `${VERSION_PREFIX}${Date.now()}.json`;
  await put(versionPath, JSON.stringify(photos, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

// ── Status ────────────────────────────────────────────────────────────────────
export async function getStoreStatus(): Promise<{
  initialized: boolean;
  count: number;
  source: "kv" | "versioned_blob" | "legacy_blob" | "local_file" | "empty";
}> {
  if (kvAvailable()) {
    try {
      const { kv } = await import("@vercel/kv");
      const data = await kv.get<Photo[]>(KV_KEY);
      if (Array.isArray(data)) {
        return { initialized: true, count: data.length, source: "kv" };
      }
      return { initialized: false, count: 0, source: "kv" };
    } catch { /* fall through */ }
  }

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: VERSION_PREFIX });
    if (blobs.length > 0) {
      const latest = blobs.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )[0];
      const res = await fetch(latest.url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return { initialized: true, count: data.length, source: "versioned_blob" };
        }
      }
      return { initialized: false, count: 0, source: "versioned_blob" };
    }
  } catch { /* fall through */ }

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: LEGACY_PATH });
    if (blobs.length > 0) return { initialized: false, count: 0, source: "legacy_blob" };
  } catch { /* ignore */ }

  return { initialized: false, count: 0, source: "local_file" };
}

// ── Initialize if empty ───────────────────────────────────────────────────────
export async function initializeIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  const status = await getStoreStatus();
  if (status.initialized) return { seeded: false, count: status.count };

  const fs   = await import("fs");
  const path = await import("path");
  const local = path.join(process.cwd(), "data", "photos.json");
  const photos: Photo[] = JSON.parse(fs.readFileSync(local, "utf-8"));
  await writePhotos(photos);
  return { seeded: true, count: photos.length };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export async function addPhoto(photo: Photo): Promise<Photo[]> {
  const photos = await readPhotos();
  photos.push(photo);
  await writePhotos(photos);
  return photos;
}

export async function removePhoto(id: string): Promise<Photo[]> {
  const all     = await readPhotos();
  const removed = all.find((p) => p.id === id);
  const photos  = all.filter((p) => p.id !== id);
  await writePhotos(photos);

  // Delete asset from the correct store
  if (removed) {
    if (removed.publicId) {
      // Cloudinary asset — delete via Admin API
      try {
        const { v2: cloudinary } = await import("cloudinary");
        await cloudinary.uploader.destroy(removed.publicId);
      } catch { /* ignore — metadata already removed */ }
    } else if (removed.src?.includes("vercel-storage.com")) {
      // Legacy Blob asset
      try {
        const { del } = await import("@vercel/blob");
        await del(removed.src);
      } catch { /* ignore */ }
    }
    // /uploads/ static files are committed to git — nothing to delete
  }

  return photos;
}

export async function updatePhoto(
  id: string,
  patch: Partial<Pick<Photo, "alt" | "category" | "featured" | "published">>
): Promise<Photo[]> {
  const photos = (await readPhotos()).map((p) =>
    p.id === id ? { ...p, ...patch } : p
  );
  await writePhotos(photos);
  return photos;
}
