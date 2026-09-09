"use client";

import { useState } from "react";
import { Flame, Beef, Droplets, Wheat, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyMenu, NutrientKey } from "@/lib/supabase/types";
import { NUTRIENT_KEYS, getPortionNutrition } from "@/lib/supabase/types";
import { NUTRITION_LABELS, NUTRITION_UNITS, PORTIONS } from "@/lib/constants";

interface NutritionTableProps {
  menu: DailyMenu;
}

const NUTRITION_ICONS: Record<NutrientKey, typeof Flame> = {
  energy: Flame,
  protein: Beef,
  fat: Droplets,
  carbs: Wheat,
  fiber: Leaf,
};

const NUTRITION_COLORS: Record<NutrientKey, string> = {
  energy: "text-orange-500 bg-orange-50",
  protein: "text-red-500 bg-red-50",
  fat: "text-amber-500 bg-amber-50",
  carbs: "text-blue-500 bg-blue-50",
  fiber: "text-emerald-500 bg-emerald-50",
};

export function NutritionTable({ menu }: NutritionTableProps) {
  const [portionKey, setPortionKey] = useState(PORTIONS[0].key);

  const activePortion = PORTIONS.find((p) => p.key === portionKey)!;
  const current = getPortionNutrition(menu, portionKey);

  const nutrients = NUTRIENT_KEYS.map((key) => ({
    key,
    label: NUTRITION_LABELS[key],
    unit: NUTRITION_UNITS[key],
    value: current[key],
    Icon: NUTRITION_ICONS[key],
    color: NUTRITION_COLORS[key],
  }));

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 card-hover animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-bold text-foreground">Informasi Gizi</h3>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold",
            activePortion.chip,
          )}
        >
          <activePortion.icon size={12} strokeWidth={2.4} />
          {activePortion.group} · {activePortion.short}
        </span>
      </div>

      {/* Portion Toggle — 4 kategori porsi */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-surface rounded-xl p-1.5 mb-5">
        {PORTIONS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPortionKey(p.key)}
            className={cn(
              "px-2.5 py-2 rounded-lg text-left transition-all duration-200",
              portionKey === p.key
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="block text-[9px] font-bold uppercase tracking-wider opacity-70">
              {p.group}
            </span>
            <span className="block text-[11px] font-bold leading-tight">
              {p.short}
            </span>
          </button>
        ))}
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
                  bgColor,
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

      {/* Hint */}
      <p className="text-[11px] text-muted-foreground text-center mt-4">
        Menampilkan gizi {activePortion.group.toLowerCase()} untuk{" "}
        <span className="font-semibold">{activePortion.short}</span>. Pilih
        kategori lain di atas untuk membandingkan.
      </p>
    </div>
  );
}
