import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent browsers guessing content types (stops MIME-sniffing attacks)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent the site from being embedded in an iframe (clickjacking protection)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Limit referrer info sent to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features we don't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Force HTTPS for 1 year (only active when served over HTTPS — safe on Vercel)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Content Security Policy — tightened for a Next.js + Cloudinary site
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts need 'unsafe-inline'; lock down further with nonces if needed
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // Allow images from self, data URIs, Cloudinary, Vercel Blob, and Unsplash
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.public.blob.vercel-storage.com https://images.unsplash.com",
      // Allow fonts from self
      "font-src 'self'",
      // Allow API calls to Resend, Cloudinary, Vercel Blob
      "connect-src 'self' https://api.resend.com https://api.cloudinary.com https://*.public.blob.vercel-storage.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
