import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Mengizinkan optimasi gambar dari semua project Supabase
        // (mis. https://<project-ref>.supabase.co/storage/v1/object/public/menu-photos/...)
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
