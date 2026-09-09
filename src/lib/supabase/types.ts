export type PortionKey = "balita" | "ibu" | "tk" | "sd";
export type NutrientKey = "energy" | "protein" | "fat" | "carbs" | "fiber";

export const NUTRIENT_KEYS = [
  "energy",
  "protein",
  "fat",
  "carbs",
  "fiber",
] as const;

export interface DailyMenu {
  id: string;
  menu_date: string;
  menu_name: string;
  menu_components: string[];
  photo_url: string | null;

  batch1_production_time: string | null;
  batch1_delivery_start: string | null;
  batch1_delivery_end: string | null;
  batch1_delivered?: boolean;

  batch2_production_time: string | null;
  batch2_delivery_start: string | null;
  batch2_delivery_end: string | null;
  batch2_delivered?: boolean;

  batch3_production_time: string | null;
  batch3_delivery_start: string | null;
  batch3_delivery_end: string | null;
  batch3_delivered?: boolean;

  safe_hours: number;
  beneficiary_count: number;
  nutritionist_name: string | null;

  // Nutrition Info (1) Porsi Kecil — Balita
  energy_balita: number | null;
  protein_balita: number | null;
  fat_balita: number | null;
  carbs_balita: number | null;
  fiber_balita: number | null;

  // Nutrition Info (2) Porsi Besar — Ibu Hamil & Ibu Menyusui
  energy_ibu: number | null;
  protein_ibu: number | null;
  fat_ibu: number | null;
  carbs_ibu: number | null;
  fiber_ibu: number | null;

  // Nutrition Info (3) Porsi Kecil — TK/PAUD/KB/RA/SD 1-3
  energy_tk: number | null;
  protein_tk: number | null;
  fat_tk: number | null;
  carbs_tk: number | null;
  fiber_tk: number | null;

  // Nutrition Info (4) Porsi Besar — SD 4-6/SMP/SMA
  energy_sd: number | null;
  protein_sd: number | null;
  fat_sd: number | null;
  carbs_sd: number | null;
  fiber_sd: number | null;

  created_at: string;
  updated_at: string;
}

export interface KitchenConfig {
  id: string;
  kitchen_name: string;
  instagram_url: string | null;
  tiktok_url: string | null;
  updated_at: string;
}

export interface NutritionInfo {
  energy: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  fiber: number | null;
}

/** Ambil nilai gizi untuk satu kategori porsi (balita | ibu | tk | sd). */
export function getPortionNutrition(
  menu: DailyMenu,
  portion: PortionKey,
): NutritionInfo {
  return {
    energy: menu[`energy_${portion}`],
    protein: menu[`protein_${portion}`],
    fat: menu[`fat_${portion}`],
    carbs: menu[`carbs_${portion}`],
    fiber: menu[`fiber_${portion}`],
  };
}
