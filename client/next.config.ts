import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // NOTE: i.pravatar.cc removed — third-party random avatar service is an
      // unnecessary attack surface. Replace with a controlled avatar solution.
      {
        protocol: "https",
        hostname: "**.smilecare.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // Security Headers (MEDIUM fix)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js needs 'unsafe-inline' for styles; tighten once using nonces
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // Allow scripts from self and Vercel analytics
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              // Allow connections to Supabase and backend API
              "connect-src 'self' https://*.supabase.co https://*.onrender.com wss://*.supabase.co",
              // Images from whitelisted domains
              "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://res.cloudinary.com https://*.smilecare.com",
              // Media
              "media-src 'self'",
              // Frame protection
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable HSTS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
