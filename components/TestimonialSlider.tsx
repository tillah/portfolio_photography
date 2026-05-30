"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote:
      "Elara captured our proposal in a way that still leaves me speechless. Every single image tells the story of one of the most important moments of my life. Truly an exceptional photographer.",
    name: "Sophie & James",
    event: "Proposal, Kensington Gardens",
  },
  {
    quote:
      "I had my graduation portraits done with Elara after seeing her work online. The photos are absolutely stunning — she made me feel completely at ease and the results exceeded every expectation.",
    name: "Amara K.",
    event: "Graduation, UCL",
  },
  {
    quote:
      "We hired Elara for my mother's 60th birthday celebration. She has a genuine gift for capturing authentic emotion. Our whole family was blown away when we saw the final gallery.",
    name: "The Okonkwo Family",
    event: "Birthday Celebration, London",
  },
  {
    quote:
      "The studio session was unlike anything I'd experienced before. Elara creates an atmosphere where you feel relaxed and truly seen. My portraits are pieces of art I'll treasure forever.",
    name: "Charlotte M.",
    event: "Studio Portrait Session",
  },
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="bg-[#fafaf8] py-20 md:py-28 border-t border-[#e8e0d6]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="font-[var(--font-jost)] text-[10px] tracking-[0.3em] uppercase text-[#9c9289] mb-12">
          Client Stories
        </p>

        <div className="relative min-h-[180px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="font-[var(--font-cormorant)] text-2xl md:text-3xl font-light text-[#1a1a1a] leading-relaxed mb-8 italic">
                &ldquo;{testimonials[current].quote}&rdquo;
              </p>
              <p className="font-[var(--font-jost)] text-sm text-[#1a1a1a] tracking-wide">
                {testimonials[current].name}
              </p>
              <p className="font-[var(--font-jost)] text-xs text-[#9c9289] tracking-wide mt-1">
                {testimonials[current].event}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center items-center gap-6 mt-10">
          <button
            onClick={prev}
            className="text-[#9c9289] hover:text-[#1a1a1a] transition-colors text-xl"
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-px transition-all duration-300 ${i === current ? "w-8 bg-[#1a1a1a]" : "w-3 bg-[#c8bdb4]"}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="text-[#9c9289] hover:text-[#1a1a1a] transition-colors text-xl"
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
