import Link from "next/link";

const navLinks = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://tiktok.com", label: "TikTok" },
  { href: "mailto:hello@elaravoss.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1C2A5A] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-12">
          {/* Brand */}
          <div>
            <p className="font-[var(--font-tenor)] text-2xl font-light tracking-[0.15em] uppercase mb-4">
              Elara Voss
            </p>
            <p className="font-[var(--font-roboto)] text-xs text-[#A85232] leading-relaxed tracking-wide">
              Luxury event & portrait photographer
              <br />
              based in London, UK
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.22em] uppercase text-[#A85232] mb-5">
              Navigation
            </p>
            <ul className="space-y-3">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-[var(--font-roboto)] text-sm text-white/80 hover:text-white transition-colors tracking-wide"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <p className="font-[var(--font-roboto)] text-[10px] tracking-[0.22em] uppercase text-[#A85232] mb-5">
              Connect
            </p>
            <ul className="space-y-3">
              {socialLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="font-[var(--font-roboto)] text-sm text-white/80 hover:text-white transition-colors tracking-wide"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-block font-[var(--font-roboto)] text-[10px] tracking-[0.2em] uppercase border border-white/40 px-6 py-3 hover:bg-white hover:text-[#1C2A5A] transition-all duration-300"
              >
                Book a Session
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-[var(--font-roboto)] text-[10px] text-white/40 tracking-widest uppercase">
            © {new Date().getFullYear()} Elara Voss Photography. All rights reserved.
          </p>
          <p className="font-[var(--font-roboto)] text-[10px] text-white/40 tracking-widest uppercase">
            London, United Kingdom
          </p>
        </div>
      </div>
    </footer>
  );
}
