"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface CTASectionProps {
  heading?: string;
  subheading?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  dark?: boolean;
}

export default function CTASection({
  heading = "Ready to capture your story?",
  subheading = "Every milestone deserves to be remembered. Let's create something beautiful together.",
  primaryLabel = "Book a Session",
  primaryHref = "/contact",
  secondaryLabel = "View Portfolio",
  secondaryHref = "/portfolio",
  dark = false,
}: CTASectionProps) {
  const bg = dark ? "bg-[#1C2A5A]" : "bg-[#F5F1E8]";
  const text = dark ? "text-white" : "text-[#1C2A5A]";
  const sub = dark ? "text-white/60" : "text-[#624332]";
  const btn1 = dark
    ? "bg-white text-[#1C2A5A] hover:bg-white/90"
    : "bg-[#1C2A5A] text-white hover:bg-[#2A3D7A]";
  const btn2 = dark
    ? "border-white/50 text-white hover:bg-white hover:text-[#1C2A5A]"
    : "border-[#1C2A5A] text-[#1C2A5A] hover:bg-[#1C2A5A] hover:text-white";

  return (
    <section className={`${bg} py-20 md:py-28`}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={`font-[var(--font-tenor)] text-4xl md:text-5xl font-light ${text} mb-5`}>
            {heading}
          </h2>
          <p className={`font-[var(--font-roboto)] text-sm ${sub} leading-relaxed tracking-wide max-w-lg mx-auto mb-10`}>
            {subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={primaryHref}
              className={`font-[var(--font-roboto)] text-[11px] tracking-[0.2em] uppercase px-10 py-4 transition-colors duration-300 ${btn1}`}
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className={`font-[var(--font-roboto)] text-[11px] tracking-[0.2em] uppercase border px-10 py-4 transition-all duration-300 ${btn2}`}
            >
              {secondaryLabel}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
