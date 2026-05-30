import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Tehillah to book a photography session or discuss your upcoming event. Based in London.",
};

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.3em] uppercase text-[#A85232] mb-4">
            Get in touch
          </p>
          <h1 className="font-[var(--font-tenor)] text-5xl md:text-6xl lg:text-7xl font-light text-[#1C2A5A] leading-tight max-w-xl">
            Let&apos;s begin
            <br />
            <em className="italic">your story.</em>
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Info */}
          <FadeIn>
            <div>
              <p className="font-[var(--font-roboto)] text-sm text-[#624332] leading-relaxed tracking-wide max-w-sm mb-12">
                Whether you&apos;re planning a proposal, counting down to
                graduation, or dreaming of a studio session — I&apos;d love to
                hear about your vision. Fill in the form and I&apos;ll be in
                touch within 48 hours.
              </p>

              <div className="space-y-8">
                <div>
                  <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.2em] uppercase text-[#A85232] mb-2">
                    Email
                  </p>
                  <a
                    href="mailto:tehillahmuchato@gmail.com"
                    className="font-[var(--font-tenor)] text-2xl font-light text-[#1C2A5A] hover:text-[#A85232] transition-colors"
                  >
                    tehillahmuchato@gmail.com
                  </a>
                </div>

                <div>
                  <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.2em] uppercase text-[#A85232] mb-2">
                    Location
                  </p>
                  <p className="font-[var(--font-tenor)] text-2xl font-light text-[#1C2A5A]">
                    London, United Kingdom
                  </p>
                  <p className="font-[var(--font-roboto)] text-xs text-[#A85232] mt-1 tracking-wide">
                    Available to travel for destination shoots
                  </p>
                </div>

                <div>
                  <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.2em] uppercase text-[#A85232] mb-4">
                    Follow my work
                  </p>
                  <div className="flex gap-6">
                    <a
                      href="https://instagram.com/tillah.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-[var(--font-roboto)] text-sm text-[#1C2A5A] hover:text-[#A85232] transition-colors tracking-wide border-b border-[#E2D9C8] pb-px"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-[var(--font-roboto)] text-sm text-[#1C2A5A] hover:text-[#A85232] transition-colors tracking-wide border-b border-[#E2D9C8] pb-px"
                    >
                      TikTok
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={0.15}>
            <Suspense fallback={<div />}>
              <ContactForm />
            </Suspense>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
