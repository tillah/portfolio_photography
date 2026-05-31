"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Photo } from "@/lib/photos";
import Lightbox from "@/components/Lightbox";

const HIGHLIGHTS_PER_CATEGORY = 3;

const filters: { label: string; value: "all" | Category }[] = [
  { label: "Highlights", value: "all" },
  { label: "Proposals", value: "proposals" },
  { label: "Graduations", value: "graduations" },
  { label: "Events", value: "events" },
  { label: "Studio", value: "studio" },
];

export default function PortfolioGallery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramCategory = searchParams.get("category") as Category | null;

  const [active, setActive] = useState<"all" | Category>(
    paramCategory && filters.some((f) => f.value === paramCategory)
      ? paramCategory
      : "all"
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then(setPhotos)
      .catch(() => setPhotos([]));
  }, []);

  const filtered = active === "all"
    ? (["proposals", "graduations", "events", "studio"] as Category[]).flatMap((cat) =>
        photos.filter((p) => p.category === cat).slice(0, HIGHLIGHTS_PER_CATEGORY)
      )
    : photos.filter((p) => p.category === active);

  const currentIndex = lightboxPhoto
    ? filtered.findIndex((p) => p.id === lightboxPhoto.id)
    : -1;

  const openLightbox = (photo: Photo) => setLightboxPhoto(photo);
  const closeLightbox = () => setLightboxPhoto(null);

  const prevPhoto = useCallback(() => {
    if (currentIndex > 0) setLightboxPhoto(filtered[currentIndex - 1]);
    else setLightboxPhoto(filtered[filtered.length - 1]);
  }, [currentIndex, filtered]);

  const nextPhoto = useCallback(() => {
    if (currentIndex < filtered.length - 1) setLightboxPhoto(filtered[currentIndex + 1]);
    else setLightboxPhoto(filtered[0]);
  }, [currentIndex, filtered]);

  const handleFilter = (value: "all" | Category) => {
    setActive(value);
    setLightboxPhoto(null);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("category");
    else params.set("category", value);
    router.replace(`/portfolio?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 md:gap-6 mb-10 pb-6 border-b border-[#E2D9C8]">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleFilter(value)}
            className={`font-[var(--font-roboto)] text-[10px] tracking-[0.2em] uppercase pb-1 transition-all duration-300 ${
              active === value
                ? "text-[#1C2A5A] border-b border-[#1C2A5A]"
                : "text-[#A85232] hover:text-[#1C2A5A]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6"
        >
          {filtered.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="mb-4 md:mb-6 break-inside-avoid group cursor-pointer"
              onClick={() => openLightbox(photo)}
            >
              <div className="relative overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading={i < 6 ? "eager" : "lazy"}
                  unoptimized={photo.src.startsWith("/uploads/")}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                  <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.2em] uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    View
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <Lightbox
        photo={lightboxPhoto}
        photos={filtered}
        onClose={closeLightbox}
        onPrev={prevPhoto}
        onNext={nextPhoto}
      />
    </section>
  );
}
