import type { Metadata } from "next";
import Image from "next/image";
import CTASection from "@/components/CTASection";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Elara Voss — luxury event and portrait photographer based in London. Learn about her approach to storytelling through photography.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1920&q=80"
          alt="Elara Voss — London photographer"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end pb-16 px-6 md:px-10 max-w-7xl mx-auto">
          <div>
            <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.3em] uppercase text-white/60 mb-3">
              The Photographer
            </p>
            <h1 className="font-[var(--font-tenor)] text-5xl md:text-6xl font-light text-white">
              About Elara
            </h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Portrait */}
          <FadeIn>
            <div className="relative aspect-[3/4] max-w-md">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=85"
                alt="Portrait of Elara Voss, photographer"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </FadeIn>

          {/* Copy */}
          <FadeIn delay={0.15}>
            <div className="pt-4">
              <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.3em] uppercase text-[#A85232] mb-8">
                My Story
              </p>

              <h2 className="font-[var(--font-tenor)] text-4xl md:text-5xl font-light text-[#1C2A5A] leading-tight mb-8">
                I believe every milestone
                <br />
                <em className="italic">deserves to endure.</em>
              </h2>

              <div className="space-y-5 font-[var(--font-roboto)] text-sm text-[#624332] leading-relaxed tracking-wide">
                <p>
                  My name is Elara Voss, and I&apos;ve spent the last eight
                  years photographing the moments that shape people&apos;s
                  lives. I&apos;m a London-based photographer with a deep
                  passion for human connection, emotion, and the quiet power of
                  a single image.
                </p>
                <p>
                  I didn&apos;t set out to become a photographer. I studied fine
                  art at Central Saint Martins, and somewhere between painting
                  and printmaking, I picked up a camera and never put it down.
                  What drew me in wasn&apos;t the technology — it was the
                  ability to freeze a feeling. A glance, a laugh, a tear. The
                  split second before a yes.
                </p>
                <p>
                  Over the years, I&apos;ve had the privilege of photographing
                  hundreds of proposals, graduation days, milestone
                  celebrations, and intimate studio sessions. Each one reminds
                  me why this work matters. These aren&apos;t just photographs
                  — they&apos;re evidence that you were here, that this moment
                  happened, that it meant something.
                </p>
                <p>
                  My approach is calm, unhurried, and deeply attentive. I work
                  quietly in the background at events, and with gentle direction
                  in the studio. I want you to feel comfortable, not performed.
                  The best photographs happen when people forget I&apos;m there.
                </p>
              </div>

              <div className="mt-10 pt-10 border-t border-[#E2D9C8]">
                <a
                  href="/contact"
                  className="inline-block font-[var(--font-roboto)] text-[11px] tracking-[0.2em] uppercase bg-[#1C2A5A] text-white px-10 py-4 hover:bg-[#2A3D7A] transition-colors duration-300"
                >
                  Work with me
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Values */}
      <FadeIn>
        <section className="bg-[#F5F1E8] py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.3em] uppercase text-[#A85232] mb-12 text-center">
              How I work
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: "Presence",
                  body: "I arrive early, stay late, and give your session my full, undivided attention from beginning to end.",
                },
                {
                  title: "Authenticity",
                  body: "I never manufacture emotion. I find it, wait for it, and capture it exactly as it unfolds.",
                },
                {
                  title: "Artistry",
                  body: "Every image is carefully considered — composition, light, timing. Photography that moves beyond documentation.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="text-center">
                  <h3 className="font-[var(--font-tenor)] text-3xl font-light text-[#1C2A5A] mb-4">
                    {title}
                  </h3>
                  <p className="font-[var(--font-roboto)] text-sm text-[#624332] leading-relaxed tracking-wide">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <CTASection
        heading="Let's create something together"
        subheading="Whether you have a session in mind or just want to ask a question, I'd love to hear from you."
      />
    </>
  );
}
