import type { Metadata } from "next";
import { Suspense } from "react";
import PortfolioGallery from "@/components/PortfolioGallery";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Browse the photography portfolio of Tehillah — proposals, graduations, birthday celebrations, and studio portrait sessions across London.",
};

export default function PortfolioPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 max-w-7xl mx-auto px-6 md:px-10">
        <div className="max-w-xl">
          <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.3em] uppercase text-[#A85232] mb-4">
            Work
          </p>
          <h1 className="font-[var(--font-tenor)] text-5xl md:text-6xl font-light text-[#1C2A5A] leading-tight mb-6">
            Portfolio
          </h1>
          <p className="font-[var(--font-roboto)] text-sm text-[#624332] leading-relaxed tracking-wide max-w-sm">
            A curated selection of work from proposals and graduations to
            intimate studio sessions — each image a chapter of someone's story.
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="py-24 text-center font-[var(--font-roboto)] text-sm text-[#A85232]">Loading gallery...</div>}>
        <PortfolioGallery />
      </Suspense>
    </>
  );
}
