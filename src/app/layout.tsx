import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SPPG BKS 2",
  description:
    "Pantau status keamanan pangan real-time, lihat menu harian, dan riwayat menu dari Dapur SPPG (Satuan Pelayanan Pemenuhan Gizi). Makan bergizi gratis, aman, dan terpantau.",
  keywords: [
    "SPPG",
    "food safety",
    "keamanan pangan",
    "menu harian",
    "makan bergizi gratis",
    "dapur",
    "mbg",
    "mbg bandung",
    "sppg bandung",
    "dapur sppg",
    "dapur mbg",
    "dapur mbg bandung",
    "sppg bojongloa",
    "sppg sukaasih",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
