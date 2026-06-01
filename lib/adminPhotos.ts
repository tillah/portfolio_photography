import { put, del, list, head } from "@vercel/blob";
import { Photo } from "./photos";

const DATA_BLOB_PATH = "data/photos.json";

// ── Read all photos ───────────────────────────────────────────────────────────
export async function readPhotos(): Promise<Photo[]> {
  try {
    // Try Blob store first
    const { blobs } = await list({ prefix: DATA_BLOB_PATH });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) return res.json();
    }
  } catch {
    // fall through to local file
  }

  // Fallback: local data/photos.json (dev / first deploy)
  try {
    const fs = await import("fs");
    const path = await import("path");
    const localPath = path.join(process.cwd(), "data", "photos.json");
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, "utf-8"));
    }
  } catch {/* ignore */}

  return [];
}

// ── Write all photos ──────────────────────────────────────────────────────────
export async function writePhotos(photos: Photo[]): Promise<void> {
  const json = JSON.stringify(photos, null, 2);
  await put(DATA_BLOB_PATH, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
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
    try { await del(removed.src); } catch {/* ignore */}
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
