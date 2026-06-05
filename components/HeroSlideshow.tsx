"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { heroImages } from "@/lib/photos";

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={heroImages[current].src}
            alt={heroImages[current].alt}
            fill
            priority={current === 0}
            className="object-cover"
            sizes="100vw"
            quality={90}
            unoptimized={heroImages[current].src.startsWith("/uploads/")}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6"
      >
        <motion.p
          key={`label-${current}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-[var(--font-roboto)] text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-white/70 mb-6"
        >
          {heroImages[current].label}
        </motion.p>

        <h1 className="font-[var(--font-tenor)] text-5xl md:text-7xl lg:text-8xl font-light leading-[1.1] max-w-4xl mb-8">
          Capturing the moments
          <br />
          <em className="not-italic italic">that define your story</em>
        </h1>

        <p className="font-[var(--font-roboto)] text-sm md:text-base text-white/75 tracking-wide max-w-md mb-12">
          Luxury event & portrait photography across Birmingham and beyond
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <a
            href="/contact"
            className="font-[var(--font-roboto)] text-[11px] tracking-[0.2em] uppercase bg-white text-[#1C2A5A] px-10 py-4 hover:bg-white/90 transition-colors duration-300"
          >
            Book a Session
          </a>
          <a
            href="/portfolio"
            className="font-[var(--font-roboto)] text-[11px] tracking-[0.2em] uppercase border border-white/70 px-10 py-4 hover:bg-white hover:text-[#1C2A5A] transition-all duration-300"
          >
            View Portfolio
          </a>
        </div>
      </motion.div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-px transition-all duration-500 ${i === current ? "w-10 bg-white" : "w-4 bg-white/40"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 right-8 md:right-10 flex flex-col items-center gap-2 text-white/50"
      >
        <div className="w-px h-12 bg-white/30" />
        <p className="font-[var(--font-roboto)] text-[9px] tracking-[0.2em] uppercase rotate-90 origin-center mt-4">
          Scroll
        </p>
      </motion.div>
    </section>
  );
}
