import fs from "fs";
import path from "path";
import { Photo } from "./photos";

const DATA_PATH = path.join(process.cwd(), "data", "photos.json");

export function readPhotos(): Photo[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Photo[];
  } catch {
    return [];
  }
}

export function writePhotos(photos: Photo[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(photos, null, 2), "utf-8");
}

export function addPhoto(photo: Photo): Photo[] {
  const photos = readPhotos();
  photos.push(photo);
  writePhotos(photos);
  return photos;
}

export function removePhoto(id: string): Photo[] {
  const photos = readPhotos().filter((p) => p.id !== id);
  writePhotos(photos);
  return photos;
}

export function updatePhoto(id: string, patch: Partial<Pick<Photo, "alt" | "category">>): Photo[] {
  const photos = readPhotos().map((p) => p.id === id ? { ...p, ...patch } : p);
  writePhotos(photos);
  return photos;
}
