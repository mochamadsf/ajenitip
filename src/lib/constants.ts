/**
 * Static content constants — not editable by admin.
 */

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
