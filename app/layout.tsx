import type { Metadata } from "next";
import { Tenor_Sans, Roboto } from "next/font/google";
import "./globals.css";
import ConditionalShell from "@/components/ConditionalShell";

const tenorSans = Tenor_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-tenor",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tehillah Photography | Luxury Event & Portrait Photographer",
    template: "%s | Tehillah Photography",
  },
  description:
    "Luxury event and portrait photographer based in Birmingham, specialising in proposals, graduations, birthdays, and studio sessions. Capturing the moments that define your story.",
  keywords: [
    "luxury photographer Birmingham",
    "proposal photographer",
    "graduation photographer",
    "birthday photographer",
    "studio portrait photographer",
    "event photography UK",
  ],
  authors: [{ name: "Tehillah" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://tehillahmuchato.com",
    siteName: "Tehillah Photography",
    title: "Tehillah Photography | Luxury Event & Portrait Photographer",
    description:
      "Capturing the moments that define your story — proposals, graduations, birthdays, and portraits.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Tehillah Photography" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tehillah Photography",
    description: "Capturing the moments that define your story.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${tenorSans.variable} ${roboto.variable}`}>
      <body>
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
