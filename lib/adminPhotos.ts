import { put, del, list, get } from "@vercel/blob";
import { Photo } from "./photos";

// ─────────────────────────────────────────────────────────────────────────────
// Storage paths
//
// PRIVATE_BLOB_PATH  → private Vercel Blob (no CDN cache, always fresh)
//                      Used for all new reads/writes.
//
// LEGACY_BLOB_PATH   → old public Vercel Blob (CDN-cached, stale)
//                      Read once as migration source, then ignored.
//
// Local file          → data/photos.json committed to git
//                      Last-resort fallback + seed for migrations.
// ─────────────────────────────────────────────────────────────────────────────
const PRIVATE_BLOB_PATH = "data/photos_db.json"; // private, no CDN
const LEGACY_BLOB_PATH  = "data/photos.json";     // old public path

// ── Read all photos ───────────────────────────────────────────────────────────
export async function readPhotos(): Promise<Photo[]> {
  // 1. Private blob — always fresh (no CDN), preferred path
  try {
    const result = await get(PRIVATE_BLOB_PATH, { access: "private" });
    if (result?.statusCode === 200 && result.stream) {
      const text = await new Response(result.stream).text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) return data;
    }
  } catch {
    // Not found or token issue — fall through
  }

  // 2. Legacy public blob — CDN cached but useful as one-time migration source
  try {
    const { blobs } = await list({ prefix: LEGACY_BLOB_PATH });
    if (blobs.length > 0) {
      const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    }
  } catch {
    // fall through
  }

  // 3. Local file — committed to git, reliable seed
  try {
    const fs = await import("fs");
    const path = await import("path");
    const localPath = path.join(process.cwd(), "data", "photos.json");
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, "utf-8"));
    }
  } catch { /* ignore */ }

  return [];
}

// ── Write all photos ──────────────────────────────────────────────────────────
// Writes to the PRIVATE blob — bypasses CDN so every subsequent read is fresh.
export async function writePhotos(photos: Photo[]): Promise<void> {
  const json = JSON.stringify(photos, null, 2);
  await put(PRIVATE_BLOB_PATH, json, {
    access: "private",        // ← no CDN cache: always served from origin
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// ── Sync from local seed file → Blob ─────────────────────────────────────────
// Call this once to initialize (or reset) the Blob store from the committed
// data/photos.json. Useful after a bad state or first deploy with Blob.
export async function syncFromLocal(): Promise<{ count: number }> {
  const fs = await import("fs");
  const path = await import("path");
  const localPath = path.join(process.cwd(), "data", "photos.json");
  const photos: Photo[] = JSON.parse(fs.readFileSync(localPath, "utf-8"));
  await writePhotos(photos);
  return { count: photos.length };
}

// ── Check Blob status ─────────────────────────────────────────────────────────
// Returns whether the private Blob store has been initialized.
export async function getBlobStatus(): Promise<{
  initialized: boolean;
  count: number;
  source: "private_blob" | "legacy_blob" | "local_file" | "empty";
}> {
  try {
    const result = await get(PRIVATE_BLOB_PATH, { access: "private" });
    if (result?.statusCode === 200 && result.stream) {
      const text = await new Response(result.stream).text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return { initialized: true, count: data.length, source: "private_blob" };
      }
    }
  } catch { /* not found */ }

  // Check legacy blob
  try {
    const { blobs } = await list({ prefix: LEGACY_BLOB_PATH });
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
  const all = await readPhotos();
  const removed = all.find((p) => p.id === id);
  const photos = all.filter((p) => p.id !== id);
  await writePhotos(photos);

  // Delete the image blob if it was uploaded to blob store
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
