import type { Metadata } from "next";
import Image from "next/image";
import CTASection from "@/components/CTASection";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Tehillah — Birmingham-based photographer capturing raw, unguarded moments. Her story started at eight years old with a camcorder and never stopped.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1920&q=80"
          alt="Tehillah — Birmingham photographer"
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
              About Tehillah
            </h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Portrait */}
          <FadeIn>
            <div className="relative aspect-[3/4] max-w-md bg-[#1C2A5A] overflow-hidden">
              <Image
                src="/images/tehillah-potrait_.png"
                alt="Portrait of Tehillah, photographer"
                fill
                className="object-contain object-bottom"
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
                I&apos;m the invisible photographer.
                <br />
                <em className="italic">Let me document your story.</em>
              </h2>

              <div className="space-y-5 font-[var(--font-roboto)] text-sm text-[#624332] leading-relaxed tracking-wide">
                <p>
                  Hey, my name is Tehillah. I&apos;m a Birmingham-based
                  photographer and my journey started at eight years old with a
                  JVC camcorder in my hands — a spark that would follow me
                  through every chapter. Through my teens, through
                  university, that flame never quite went out. But it wasn&apos;t
                  until 2023, serving on my church&apos;s media team, that
                  everything clicked. I stopped just recording and started
                  feeling. I realised my true passion wasn&apos;t behind the
                  camera — it was what I could capture with it.
                </p>
                <p>
                  I&apos;m drawn to moments that breathe. The quiet glances. The
                  raw, unguarded emotions that surface when people forget
                  they&apos;re being watched. I move gently through your day,
                  positioned to observe rather than direct, so nothing feels
                  staged or rushed. You stay immersed in what matters — your
                  loved ones, your moment, the feeling of it all.
                </p>
                <p>
                  With a keen eye and fast positioning, I capture candids that
                  tell the truth. Not performed. Just real. My perfectionist
                  nature means I&apos;m endlessly pushing boundaries, searching
                  for that next level of emotional clarity in every frame.
                  Because at the end of the day, I want you to look back at
                  these images and feel exactly how it felt to live that moment.
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
