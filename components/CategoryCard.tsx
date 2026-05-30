"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface CategoryCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  index: number;
}

export default function CategoryCard({
  title,
  description,
  imageSrc,
  imageAlt,
  href,
  index,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.12 }}
    >
      <Link href={href} className="group block">
        <div className="relative overflow-hidden aspect-[3/4]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="font-[var(--font-cormorant)] text-2xl font-light text-white tracking-wide">
              {title}
            </p>
          </div>
        </div>
        <div className="pt-4 pb-2">
          <p className="font-[var(--font-jost)] text-xs text-[#6b6460] leading-relaxed tracking-wide">
            {description}
          </p>
          <p className="font-[var(--font-jost)] text-[10px] tracking-[0.2em] uppercase text-[#1a1a1a] mt-3 group-hover:gap-2 transition-all">
            Explore →
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
