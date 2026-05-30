"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navBg = scrolled || !isHome || menuOpen
    ? "bg-[#F5F1E8]/95 backdrop-blur-sm border-b border-[#E2D9C8]"
    : "bg-transparent";

  const textColor = scrolled || !isHome || menuOpen
    ? "text-[#1C2A5A]"
    : "text-white";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className={`font-[var(--font-tenor)] text-xl md:text-2xl font-light tracking-[0.15em] uppercase transition-colors duration-300 ${textColor}`}>
          Tehillah
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`font-[var(--font-roboto)] text-xs tracking-[0.18em] uppercase transition-colors duration-300 hover:opacity-60 ${textColor} ${pathname === href ? "border-b border-current pb-0.5" : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden flex flex-col gap-1.5 w-6 transition-colors duration-300 ${textColor}`}
          aria-label="Toggle menu"
        >
          <motion.span
            animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }}
            transition={{ duration: 0.3 }}
            className="block h-px w-full bg-current"
          />
          <motion.span
            animate={{ opacity: menuOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="block h-px w-full bg-current"
          />
          <motion.span
            animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }}
            transition={{ duration: 0.3 }}
            className="block h-px w-full bg-current"
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100dvh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="md:hidden bg-[#F5F1E8] flex flex-col items-center justify-center overflow-hidden"
          >
            <ul className="flex flex-col items-center gap-8">
              {links.map(({ href, label }, i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                >
                  <Link
                    href={href}
                    className={`font-[var(--font-tenor)] text-3xl font-light tracking-widest text-[#1C2A5A] hover:text-[#A85232] transition-colors ${pathname === href ? "text-[#A85232]" : ""}`}
                  >
                    {label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <Link
                href="/contact"
                className="font-[var(--font-roboto)] text-xs tracking-[0.2em] uppercase border border-[#1C2A5A] px-8 py-3 hover:bg-[#1C2A5A] hover:text-white transition-all duration-300"
              >
                Book a Session
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
