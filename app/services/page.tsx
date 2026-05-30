import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Photography services by Elara Voss — proposal photography, graduation sessions, birthday events, and studio portraits. View packages and pricing.",
};

const services = [
  {
    id: "proposals",
    title: "Proposal Photography",
    tagline: "The beginning of forever, beautifully kept.",
    description:
      "A proposal is one of the most intimate, electric moments of your lives. I work discreetly — hidden in plain sight — so the moment you go down on one knee is entirely real, entirely yours, and entirely preserved.",
    included: [
      "Pre-shoot location consultation",
      "Discreet positioning and setup",
      "1–2 hour coverage",
      "50+ professionally edited images",
      "Private online gallery",
      "Print-ready high-resolution files",
    ],
    from: "£395",
    image:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=80",
    imageAlt: "Romantic proposal photography",
  },
  {
    id: "graduations",
    title: "Graduation Photography",
    tagline: "Years of hard work. One extraordinary day.",
    description:
      "Graduation is a milestone that belongs to you and everyone who believed in you. Whether you want formal portraits, candid celebrations, or both, I create images that honour the full weight of what you've achieved.",
    included: [
      "Up to 3 hours of coverage",
      "Ceremony and celebration moments",
      "Individual and group portraits",
      "75+ professionally edited images",
      "Private online gallery",
      "High-resolution digital files",
    ],
    from: "£345",
    image:
      "https://images.unsplash.com/photo-1627556592933-847e2c5e79a3?w=900&q=80",
    imageAlt: "Graduation photography",
  },
  {
    id: "birthdays",
    title: "Birthday & Event Photography",
    tagline: "Celebrations deserve to be remembered with the same joy they're lived.",
    description:
      "From elegant dinner parties to landmark milestone birthdays, I bring a quiet, editorial eye to your celebration. The laughter, the dancing, the people who matter most — nothing goes unnoticed.",
    included: [
      "2–6 hours of event coverage",
      "Candid and portrait photography",
      "Detail and décor shots",
      "100+ professionally edited images",
      "Private online gallery",
      "Print-ready digital files",
    ],
    from: "£450",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&q=80",
    imageAlt: "Birthday celebration photography",
  },
  {
    id: "studio",
    title: "Studio Portrait Sessions",
    tagline: "Just you, the light, and a lens that sees you clearly.",
    description:
      "My studio sessions are unhurried and intimate. Whether you want classic portraits, editorial fashion-inspired imagery, or professional headshots, we work together until the photographs reflect exactly who you are.",
    included: [
      "90-minute studio session",
      "Styling and direction guidance",
      "Multiple looks available",
      "30+ professionally edited images",
      "Private online gallery",
      "Commercial usage rights available",
    ],
    from: "£295",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80",
    imageAlt: "Studio portrait session",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <p className="font-[var(--font-jost)] text-[10px] tracking-[0.3em] uppercase text-[#9c9289] mb-4">
            What I offer
          </p>
          <h1 className="font-[var(--font-cormorant)] text-5xl md:text-6xl lg:text-7xl font-light text-[#1a1a1a] leading-tight max-w-2xl">
            Services &
            <br />
            <em className="italic">Packages</em>
          </h1>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="space-y-24 md:space-y-32">
          {services.map((service, i) => (
            <FadeIn key={service.id}>
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div
                  className={`relative aspect-[4/5] overflow-hidden ${
                    i % 2 === 1 ? "lg:order-2" : ""
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                {/* Content */}
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <p className="font-[var(--font-jost)] text-[10px] tracking-[0.3em] uppercase text-[#9c9289] mb-4">
                    0{i + 1}
                  </p>
                  <h2 className="font-[var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#1a1a1a] mb-3">
                    {service.title}
                  </h2>
                  <p className="font-[var(--font-cormorant)] text-xl italic text-[#9c9289] mb-6">
                    {service.tagline}
                  </p>
                  <p className="font-[var(--font-jost)] text-sm text-[#6b6460] leading-relaxed tracking-wide mb-8">
                    {service.description}
                  </p>

                  {/* Included */}
                  <div className="mb-8">
                    <p className="font-[var(--font-jost)] text-[10px] tracking-[0.2em] uppercase text-[#1a1a1a] mb-4">
                      What&apos;s included
                    </p>
                    <ul className="space-y-2">
                      {service.included.map((item) => (
                        <li
                          key={item}
                          className="font-[var(--font-jost)] text-sm text-[#6b6460] tracking-wide flex items-start gap-3"
                        >
                          <span className="text-[#c8bdb4] mt-0.5">—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6 border-t border-[#e8e0d6]">
                    <div>
                      <p className="font-[var(--font-jost)] text-[10px] tracking-[0.2em] uppercase text-[#9c9289] mb-1">
                        Starting from
                      </p>
                      <p className="font-[var(--font-cormorant)] text-4xl font-light text-[#1a1a1a]">
                        {service.from}
                      </p>
                    </div>
                    <Link
                      href={`/contact?service=${service.id}`}
                      className="font-[var(--font-jost)] text-[11px] tracking-[0.2em] uppercase bg-[#1a1a1a] text-white px-8 py-4 hover:bg-[#333] transition-colors duration-300"
                    >
                      Enquire Now
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FAQ note */}
      <FadeIn>
        <section className="border-t border-[#e8e0d6] py-16 md:py-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="font-[var(--font-cormorant)] text-2xl font-light text-[#1a1a1a] mb-4">
              Custom packages are always available
            </p>
            <p className="font-[var(--font-jost)] text-sm text-[#6b6460] leading-relaxed tracking-wide mb-8">
              If your event doesn&apos;t quite fit the above or you have
              something unique in mind, reach out. I love working on bespoke
              projects and I&apos;m always happy to talk through your vision.
            </p>
            <Link
              href="/contact"
              className="inline-block font-[var(--font-jost)] text-[11px] tracking-[0.2em] uppercase border border-[#1a1a1a] px-10 py-4 hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
            >
              Get in touch
            </Link>
          </div>
        </section>
      </FadeIn>

      <CTASection dark heading="Every moment is worth capturing" />
    </>
  );
}
