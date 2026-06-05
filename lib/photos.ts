export type Category = "proposals" | "graduations" | "events" | "studio";

export interface Photo {
  id: string;
  src: string;
  alt: string;
  category: Category;
  width: number;
  height: number;
  publicId?: string;   // Cloudinary public_id — required for deletion
  featured?: boolean;  // Shown in highlights / hero rotation
  published?: boolean; // Hidden from public gallery when false (default: true)
}

export const heroImages = [
  {
    src: "/uploads/upload_1780197552661.jpg",
    alt: "Proposal moment",
    label: "Proposals",
  },
  {
    src: "/uploads/upload_1780197370947.jpg",
    alt: "Graduation celebration",
    label: "Graduations",
  },
  {
    src: "/uploads/upload_1780197506800.jpg",
    alt: "Event celebration",
    label: "Celebrations",
  },
  {
    src: "/uploads/upload_1780197390370.jpg",
    alt: "Studio portrait session",
    label: "Studio",
  },
];

// photos array is kept only for type reference — runtime data comes from data/photos.json via API
export const photos: Photo[] = [];
