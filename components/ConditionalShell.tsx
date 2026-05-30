"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="bg-[#0f1117] text-white min-h-screen" style={{ colorScheme: "dark" }}>
        {children}
      </div>
    );
  }

  return (
    <div className="bg-[#F5F1E8] text-[#1C2A5A]">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
