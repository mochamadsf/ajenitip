import type { Metadata } from "next";

// Layout ini hanya membawa metadata (noindex) untuk seluruh area /admin —
// termasuk halaman login. Tidak menambahkan UI maupun guard auth
// (guard ada di src/proxy.ts dan admin/(dashboard)/layout.tsx).
export const metadata: Metadata = {
  title: "Panel Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
