export type Category = "proposals" | "graduations" | "birthdays" | "studio";

export interface Photo {
  id: string;
  src: string;
  alt: string;
  category: Category;
  width: number;
  height: number;
}

export const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1920&q=85",
    alt: "Romantic proposal at golden hour",
    label: "Proposals",
  },
  {
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=85",
    alt: "Graduation celebration",
    label: "Graduations",
  },
  {
    src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&q=85",
    alt: "Elegant birthday celebration",
    label: "Celebrations",
  },
  {
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920&q=85",
    alt: "Studio portrait session",
    label: "Studio",
  },
];

// photos array is kept only for type reference — runtime data comes from data/photos.json via API
export const photos: Photo[] = [];
