"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo } from "@/lib/photos";

interface LightboxProps {
  photo: Photo | null;
  photos: Photo[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  photo,
  photos,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (photo) {
      document.body.classList.add("lightbox-open");
    } else {
      document.body.classList.remove("lightbox-open");
    }
    return () => document.body.classList.remove("lightbox-open");
  }, [photo]);

  const currentIndex = photos.findIndex((p) => p.id === photo?.id);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10 font-[var(--font-roboto)] text-xs tracking-[0.2em] uppercase"
          >
            Close ✕
          </button>

          {/* Counter */}
          <p className="absolute top-6 left-6 text-white/50 font-[var(--font-roboto)] text-xs tracking-widest">
            {currentIndex + 1} / {photos.length}
          </p>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors text-3xl z-10 p-4"
            aria-label="Previous"
          >
            ←
          </button>

          {/* Image */}
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative max-h-[85vh] max-w-[85vw] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-contain"
              sizes="85vw"
              quality={90}
            />
          </motion.div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors text-3xl z-10 p-4"
            aria-label="Next"
          >
            →
          </button>

          {/* Caption */}
          <p className="absolute bottom-6 text-white/50 font-[var(--font-roboto)] text-xs tracking-wide">
            {photo.alt}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
