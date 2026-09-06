"use client";

import { useState } from "react";
import { Flame, Beef, Droplets, Wheat, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyMenu } from "@/lib/supabase/types";
import { getSmallPortion, getLargePortion, type NutritionInfo } from "@/lib/supabase/types";
import { NUTRITION_LABELS, NUTRITION_UNITS } from "@/lib/constants";

interface NutritionTableProps {
  menu: DailyMenu;
}

const NUTRITION_ICONS: Record<string, typeof Flame> = {
  energy: Flame,
  protein: Beef,
  fat: Droplets,
  carbs: Wheat,
  fiber: Leaf,
};

const NUTRITION_COLORS: Record<string, string> = {
  energy: "text-orange-500 bg-orange-50",
  protein: "text-red-500 bg-red-50",
  fat: "text-amber-500 bg-amber-50",
  carbs: "text-blue-500 bg-blue-50",
  fiber: "text-emerald-500 bg-emerald-50",
};

type PortionSize = "small" | "large";

export function NutritionTable({ menu }: NutritionTableProps) {
  const [portion, setPortion] = useState<PortionSize>("small");

  const small = getSmallPortion(menu);
  const large = getLargePortion(menu);
  const current = portion === "small" ? small : large;

  const nutrients = (Object.keys(NUTRITION_LABELS) as Array<keyof NutritionInfo>).map(
    (key) => ({
      key,
      label: NUTRITION_LABELS[key],
      unit: NUTRITION_UNITS[key],
      value: current[key],
      Icon: NUTRITION_ICONS[key] || Flame,
      color: NUTRITION_COLORS[key] || "text-gray-500 bg-gray-50",
    })
  );

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 card-hover animate-fade-in">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-foreground">Informasi Gizi</h3>

        {/* Portion Toggle */}
        <div className="flex bg-surface rounded-lg p-1">
          <button
            onClick={() => setPortion("small")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
              portion === "small"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Porsi Kecil
          </button>
          <button
            onClick={() => setPortion("large")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
              portion === "large"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Porsi Besar
          </button>
        </div>
      </div>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {nutrients.map(({ key, label, unit, value, Icon, color }) => {
          const [textColor, bgColor] = color.split(" ");
          return (
            <div
              key={key}
              className="flex flex-col items-center p-4 rounded-xl bg-surface hover:bg-surface-hover transition-colors"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-2",
                  bgColor
                )}
              >
                <Icon size={18} strokeWidth={2} className={textColor} />
              </div>
              <span className="text-[11px] text-muted-foreground font-medium mb-1">
                {label}
              </span>
              <span className="text-lg font-bold text-foreground tabular-nums">
                {value != null ? value : "—"}
              </span>
              <span className="text-[10px] text-muted-foreground">{unit}</span>
            </div>
          );
        })}
      </div>

      {/* Comparison hint */}
      <p className="text-[11px] text-muted-foreground text-center mt-4">
        {portion === "small"
          ? "Menampilkan info gizi porsi kecil. Tap 'Porsi Besar' untuk melihat porsi besar."
          : "Menampilkan info gizi porsi besar. Tap 'Porsi Kecil' untuk melihat porsi kecil."}
      </p>
    </div>
  );
}
