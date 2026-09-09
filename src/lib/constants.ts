/**
 * Static content constants — not editable by admin.
 */

import type { LucideIcon } from "lucide-react";
import { Baby, GraduationCap, Heart, School } from "lucide-react";
import type { PortionKey } from "@/lib/supabase/types";

export const SAFETY_WARNING_TITLE = "⚠ Peringatan Keamanan Pangan";

export const SAFETY_WARNING_ITEMS = [
  "Makanan sudah melewati batas waktu aman konsumsi (lebih dari masa aman setelah pengiriman).",
  "Makanan berubah warna, bau, atau tekstur secara tidak wajar.",
  "Makanan terjatuh atau tercemar benda asing.",
  "Kemasan/wadah makanan rusak atau terbuka sebelum waktu penyajian.",
  "Makanan tidak disimpan pada suhu yang sesuai.",
];

export const SERVING_SUGGESTIONS_TITLE = "Saran Penyajian";

export const SERVING_SUGGESTIONS = [
  "Konsumsi makanan segera setelah diterima untuk menjaga kualitas dan keamanan.",
  "Pastikan tangan dalam keadaan bersih sebelum menyentuh makanan.",
  "Gunakan sendok/garpu bersih untuk menyantap makanan.",
  "Jika tidak langsung dimakan, simpan makanan di tempat sejuk dan tertutup, serta konsumsi dalam waktu maksimal 1 jam.",
  "Untuk porsi anak, pastikan suhu makanan tidak terlalu panas sebelum disajikan.",
];

export const DEFAULT_KITCHEN_NAME = "Dapur SPPG";

export const CERTIFICATION_LOGOS = [
  { name: "Halal", alt: "Sertifikasi Halal" },
  { name: "SLHS", alt: "Sertifikasi SLHS" },
  { name: "BNSP", alt: "Sertifikasi BNSP" },
  { name: "Badan Gizi Nasional", alt: "Badan Gizi Nasional" },
  { name: "Yayasan", alt: "Yayasan" },
];

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" as const },
  { href: "/food-safety", label: "Food Safety", icon: "ShieldCheck" as const },
  { href: "/menu-hari-ini", label: "Menu Hari Ini", icon: "UtensilsCrossed" as const },
  { href: "/riwayat-menu", label: "Riwayat Menu", icon: "CalendarDays" as const },
];

export const NUTRITION_LABELS: Record<string, string> = {
  energy: "Energi",
  protein: "Protein",
  fat: "Lemak",
  carbs: "Karbohidrat",
  fiber: "Serat",
};

export const NUTRITION_UNITS: Record<string, string> = {
  energy: "kkal",
  protein: "g",
  fat: "g",
  carbs: "g",
  fiber: "g",
};

// ── 4 Kategori Porsi (sesuai standar MBG) ──────────────────────────────

export interface PortionConfig {
  key: PortionKey;
  /** Label singkat untuk toggle/tab */
  short: string;
  /** Kelompok porsi: "Porsi Kecil" / "Porsi Besar" */
  group: string;
  /** Nama lengkap kategori penerima */
  title: string;
  icon: LucideIcon;
  /** Kelas warna chip header kartu */
  chip: string;
  /** Kelas warna teks aksen */
  accent: string;
}

export const PORTIONS: PortionConfig[] = [
  {
    key: "balita",
    short: "Balita",
    group: "Porsi Kecil",
    title: "Balita",
    icon: Baby,
    chip: "bg-amber-50 text-amber-700",
    accent: "text-amber-600",
  },
  {
    key: "ibu",
    short: "Ibu Hamil & Menyusui",
    group: "Porsi Besar",
    title: "Ibu Hamil & Ibu Menyusui",
    icon: Heart,
    chip: "bg-rose-50 text-rose-700",
    accent: "text-rose-600",
  },
  {
    key: "tk",
    short: "TK/PAUD/KB/RA/SD 1-3",
    group: "Porsi Kecil",
    title: "TK/PAUD/KB/RA/SD 1-3",
    icon: School,
    chip: "bg-sky-50 text-sky-700",
    accent: "text-sky-600",
  },
  {
    key: "sd",
    short: "SD 4-6/SMP/SMA",
    group: "Porsi Besar",
    title: "SD 4-6/SMP/SMA",
    icon: GraduationCap,
    chip: "bg-emerald-50 text-emerald-700",
    accent: "text-emerald-600",
  },
];
