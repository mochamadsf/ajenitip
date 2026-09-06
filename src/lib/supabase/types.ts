export interface DailyMenu {
  id: string;
  menu_date: string;
  menu_name: string;
  menu_components: string[];
  photo_url: string | null;
  batch1_production_time: string | null;
  batch1_delivery_time: string | null;
  batch1_delivered?: boolean;
  batch2_production_time: string | null;
  batch2_delivery_time: string | null;
  batch2_delivered?: boolean;
  batch3_production_time: string | null;
  batch3_delivery_time: string | null;
  batch3_delivered?: boolean;
  safe_hours: number;
  beneficiary_count: number;
  nutritionist_name: string | null;
  energy_small: number | null;
  protein_small: number | null;
  fat_small: number | null;
  carbs_small: number | null;
  fiber_small: number | null;
  energy_large: number | null;
  protein_large: number | null;
  fat_large: number | null;
  carbs_large: number | null;
  fiber_large: number | null;
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

export function getSmallPortion(menu: DailyMenu): NutritionInfo {
  return {
    energy: menu.energy_small,
    protein: menu.protein_small,
    fat: menu.fat_small,
    carbs: menu.carbs_small,
    fiber: menu.fiber_small,
  };
}

export function getLargePortion(menu: DailyMenu): NutritionInfo {
  return {
    energy: menu.energy_large,
    protein: menu.protein_large,
    fat: menu.fat_large,
    carbs: menu.carbs_large,
    fiber: menu.fiber_large,
  };
}
