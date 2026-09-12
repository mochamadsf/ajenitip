"use client";

import { useKitchenConfig } from "@/lib/supabase/hooks";
import { SPPG_LABEL, SPPG_HEAD_NAME } from "@/lib/constants";

// Custom SVG icons for social media
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const CERTIFICATIONS = [
  {
    name: "Halal",
    url: "https://akcdn.detik.net.id/community/media/visual/2022/03/15/kenapa-logo-halal-diganti-ada-perpindahan-wewenang-dari-mui-ke-kemenag.jpeg?w=700&q=90",
  },
  {
    name: "SLHS",
    url: "https://zonalogo.com/assets/sertifikat-laik-higiene-sanitasi-slhs.webp?preview=landscape&w=960",
  },
  {
    name: "BNSP",
    url: "https://i0.wp.com/environment-indonesia.com/wp-content/uploads/2020/08/Logo-BNSP.png?ssl=1",
  },
  { name: "Badan Gizi Nasional", url: "https://www.bgn.go.id/logo-bgn.png" },
];

export function Footer() {
  const { config } = useKitchenConfig();

  return (
    <footer className="border-t border-border bg-white mt-auto">
      {/* Certification Strip */}
      <div className="border-b border-border py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">
            Sertifikasi & Afiliasi
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.name}
                className="flex items-center justify-center h-16 bg-white rounded-xl hover:opacity-80 transition-opacity"
                title={`Sertifikasi ${cert.name}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cert.url}
                  alt={`Logo ${cert.name}`}
                  className="h-full w-auto object-contain max-w-[120px]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social & Copyright */}
      <div className="py-5 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-3">
            {config?.instagram_url && (
              <a
                href={config.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
                <span className="text-xs font-medium">Instagram</span>
              </a>
            )}
            {config?.tiktok_url && (
              <a
                href={config.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
                aria-label="TikTok"
              >
                <TikTokIcon size={18} />
                <span className="text-xs font-medium">TikTok</span>
              </a>
            )}
          </div>

          {/* Copyright — kredit resmi SPPG & Kepala SPPG */}
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} {SPPG_LABEL} — Kepala SPPG:{" "}
            {SPPG_HEAD_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}
