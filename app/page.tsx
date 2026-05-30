import type { Metadata } from "next";
import HeroSlideshow from "@/components/HeroSlideshow";
import CategoryCard from "@/components/CategoryCard";
import CTASection from "@/components/CTASection";
import TestimonialSlider from "@/components/TestimonialSlider";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Elara Voss Photography | Luxury Event & Portrait Photographer London",
  description:
    "London-based luxury photographer specialising in proposals, graduations, birthdays, and studio portrait sessions. Book your session today.",
};

const categories = [
  {
    title: "Proposals",
    description:
      "The moment you say yes deserves to be remembered forever. Discreet, heartfelt, and beautifully captured.",
    imageSrc:
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    imageAlt: "Romantic proposal at golden hour",
    href: "/portfolio?category=proposals",
  },
  {
    title: "Graduations",
    description:
      "Years of dedication, one extraordinary day. Celebrate the achievement with images that honour the journey.",
    imageSrc:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    imageAlt: "Graduation celebration",
    href: "/portfolio?category=graduations",
  },
  {
    title: "Birthdays",
    description:
      "From intimate gatherings to landmark celebrations — your story, beautifully told.",
    imageSrc:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    imageAlt: "Elegant birthday celebration",
    href: "/portfolio?category=birthdays",
  },
  {
    title: "Studio",
    description:
      "Timeless portraits in a controlled, creative environment. Just you, the light, and the lens.",
    imageSrc:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
    imageAlt: "Studio portrait session",
    href: "/portfolio?category=studio",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSlideshow />

      {/* Intro strip */}
      <FadeIn>
        <section className="py-16 md:py-20 border-b border-[#E2D9C8]">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.3em] uppercase text-[#A85232] mb-6">
              London — Est. 2018
            </p>
            <h2 className="font-[var(--font-tenor)] text-3xl md:text-4xl font-light text-[#1C2A5A] leading-relaxed">
              Life is made of fleeting, extraordinary moments.
              <br />
              <span className="italic">My work is to preserve them.</span>
            </h2>
          </div>
        </section>
      </FadeIn>

      {/* Categories */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 md:px-10">
        <FadeIn>
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.3em] uppercase text-[#A85232] mb-3">
                Specialities
              </p>
              <h2 className="font-[var(--font-tenor)] text-4xl md:text-5xl font-light text-[#1C2A5A]">
                Every occasion, honoured
              </h2>
            </div>
            <a
              href="/portfolio"
              className="hidden md:block font-[var(--font-roboto)] text-[10px] tracking-[0.2em] uppercase text-[#624332] hover:text-[#1C2A5A] transition-colors border-b border-[#B8A898] pb-px"
            >
              View all work
            </a>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.title} {...cat} index={i} />
          ))}
        </div>
      </section>

      {/* Full-bleed quote section */}
      <FadeIn>
        <section className="relative py-28 md:py-40 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative max-w-3xl mx-auto px-6 text-center text-white">
            <p className="font-[var(--font-tenor)] text-3xl md:text-5xl font-light leading-relaxed italic">
              &ldquo;A photograph is the pause button of life —
              <br />
              the one moment that never moves.&rdquo;
            </p>
            <p className="font-[var(--font-roboto)] text-xs tracking-[0.2em] uppercase text-white/50 mt-8">
              Elara Voss
            </p>
          </div>
        </section>
      </FadeIn>

      <TestimonialSlider />

      <CTASection dark />
    </>
  );
}
