import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Elara Voss Photography | Luxury Event & Portrait Photographer",
    template: "%s | Elara Voss Photography",
  },
  description:
    "Luxury event and portrait photographer based in London, specialising in proposals, graduations, birthdays, and studio sessions. Capturing the moments that define your story.",
  keywords: [
    "luxury photographer London",
    "proposal photographer",
    "graduation photographer",
    "birthday photographer",
    "studio portrait photographer",
    "event photography UK",
  ],
  authors: [{ name: "Elara Voss" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://elaravoss.com",
    siteName: "Elara Voss Photography",
    title: "Elara Voss Photography | Luxury Event & Portrait Photographer",
    description:
      "Capturing the moments that define your story — proposals, graduations, birthdays, and portraits.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Elara Voss Photography",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elara Voss Photography",
    description: "Capturing the moments that define your story.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-[#fafaf8] text-[#1a1a1a]">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
