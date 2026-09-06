"use client";

import { UtensilsCrossed, ChevronRight } from "lucide-react";

interface MenuComponentsProps {
  components: string[];
}

export function MenuComponentsList({ components }: MenuComponentsProps) {
  if (!components || components.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 card-hover animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
          <UtensilsCrossed size={16} strokeWidth={2} className="text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Komponen Menu</h3>
      </div>

      <div className="space-y-2">
        {components.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface hover:bg-surface-hover transition-colors group"
          >
            <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
              {index + 1}
            </div>
            <span className="text-sm font-medium text-foreground flex-1">
              {item}
            </span>
            <ChevronRight
              size={14}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
