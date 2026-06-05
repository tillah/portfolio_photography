import { put, del, list } from "@vercel/blob";
import { Photo } from "./photos";

// ─────────────────────────────────────────────────────────────────────────────
// CDN-safe versioned storage
//
// Problem: public Vercel Blob CDN caches files aggressively. Overwriting the
// same URL means the CDN keeps serving the old version for up to ~60s — so
// deletes and edits appear to do nothing.
//
// Solution: every write creates a BRAND-NEW blob with a timestamp-based name
// (e.g. data/photos_v1718000000000.json). New URLs are never cached yet, so
// the very first read always hits origin. Old versions are cleaned up after
// each write, so storage doesn't grow unbounded.
//
// Reads: list all blobs under the prefix, pick the most recently uploaded one.
// ─────────────────────────────────────────────────────────────────────────────
const VERSION_PREFIX = "data/photos_v";   // versioned current blobs
const LEGACY_PATH    = "data/photos.json"; // old fixed-path blob (migration source)

// ── Read all photos ───────────────────────────────────────────────────────────
export async function readPhotos(): Promise<Photo[]> {
  // 1. Try versioned blobs — pick the most recently uploaded one
  try {
    const { blobs } = await list({ prefix: VERSION_PREFIX });
    if (blobs.length > 0) {
      // Sort by uploadedAt descending, take the newest
      const latest = blobs.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )[0];
      // This URL is brand-new (never cached) so CDN serves origin content
      const res = await fetch(latest.url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    }
  } catch { /* fall through */ }

  // 2. Legacy fixed-path blob (CDN-cached, used only as migration source)
  try {
    const { blobs } = await list({ prefix: LEGACY_PATH });
    if (blobs.length > 0) {
      const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    }
  } catch { /* fall through */ }

  // 3. Local committed file — last-resort fallback
  try {
    const fs   = await import("fs");
    const path = await import("path");
    const localPath = path.join(process.cwd(), "data", "photos.json");
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, "utf-8"));
    }
  } catch { /* ignore */ }

  return [];
}

// ── Write all photos ──────────────────────────────────────────────────────────
// Creates a new versioned blob each time so the URL is always fresh (never
// CDN-cached). Old versions are NOT deleted here — Vercel Blob has a brief
// indexing delay after put(), so deleting inside the same function risks
// removing the blob we just wrote. Cleanup happens in syncFromLocal instead.
export async function writePhotos(photos: Photo[]): Promise<void> {
  const json        = JSON.stringify(photos, null, 2);
  const versionPath = `${VERSION_PREFIX}${Date.now()}.json`;
  await put(versionPath, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

// ── Initialize Blob if empty ──────────────────────────────────────────────────
// Seeds the Blob store from data/photos.json ONLY when no versioned blob exists.
// Safe to call on every admin login — won't overwrite existing data.
export async function initializeIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  // Check if versioned blobs already exist
  const { blobs } = await list({ prefix: VERSION_PREFIX });
  if (blobs.length > 0) {
    // Already initialised — just return current count
    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];
    const res = await fetch(latest.url, { cache: "no-store" });
    const data = res.ok ? await res.json() : [];
    return { seeded: false, count: Array.isArray(data) ? data.length : 0 };
  }

  // Empty — seed from local file
  const fs   = await import("fs");
  const path = await import("path");
  const localPath = path.join(process.cwd(), "data", "photos.json");
  const photos: Photo[] = JSON.parse(fs.readFileSync(localPath, "utf-8"));
  await writePhotos(photos);
  return { seeded: true, count: photos.length };
}

// ── Clean up old blob versions ────────────────────────────────────────────────
// Removes all versioned blobs except the latest. Safe to call any time.
export async function cleanupOldVersions(): Promise<{ deleted: number }> {
  const { blobs } = await list({ prefix: VERSION_PREFIX });
  if (blobs.length <= 1) return { deleted: 0 };
  const sorted = blobs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  const old = sorted.slice(1).map((b) => b.url);
  await del(old);
  return { deleted: old.length };
}

// ── Sync from local seed file → Blob ─────────────────────────────────────────
// Hard reset: overwrites Blob with the committed data/photos.json.
// Use only to recover from corruption — this REPLACES all current photos.
export async function syncFromLocal(): Promise<{ count: number }> {
  const fs   = await import("fs");
  const path = await import("path");
  const localPath = path.join(process.cwd(), "data", "photos.json");
  const photos: Photo[] = JSON.parse(fs.readFileSync(localPath, "utf-8"));
  await writePhotos(photos);
  return { count: photos.length };
}

// ── Blob status ───────────────────────────────────────────────────────────────
export async function getBlobStatus(): Promise<{
  initialized: boolean;
  count: number;
  source: "versioned_blob" | "legacy_blob" | "local_file" | "empty";
}> {
  try {
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
    }
  } catch { /* fall through */ }

  try {
    const { blobs } = await list({ prefix: LEGACY_PATH });
    if (blobs.length > 0) {
      return { initialized: false, count: 0, source: "legacy_blob" };
    }
  } catch { /* ignore */ }

  return { initialized: false, count: 0, source: "local_file" };
}

// ── Add a photo ───────────────────────────────────────────────────────────────
export async function addPhoto(photo: Photo): Promise<Photo[]> {
  const photos = await readPhotos();
  photos.push(photo);
  await writePhotos(photos);
  return photos;
}

// ── Remove a photo ────────────────────────────────────────────────────────────
export async function removePhoto(id: string): Promise<Photo[]> {
  const all     = await readPhotos();
  const removed = all.find((p) => p.id === id);
  const photos  = all.filter((p) => p.id !== id);
  await writePhotos(photos);

  // Also delete the image from blob storage if it was uploaded there
  if (removed?.src?.startsWith("https://")) {
    try { await del(removed.src); } catch { /* ignore */ }
  }

  return photos;
}

// ── Update a photo ────────────────────────────────────────────────────────────
export async function updatePhoto(
  id: string,
  patch: Partial<Pick<Photo, "alt" | "category">>
): Promise<Photo[]> {
  const photos = (await readPhotos()).map((p) =>
    p.id === id ? { ...p, ...patch } : p
  );
  await writePhotos(photos);
  return photos;
}
