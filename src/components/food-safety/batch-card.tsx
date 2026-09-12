"use client";

import { Truck, Clock, CheckCircle2, Timer, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyMenu } from "@/lib/supabase/types";
import { formatTimeRange } from "@/lib/time";

interface BatchCardProps {
  menu: DailyMenu;
  batch: 1 | 2 | 3;
}

export function BatchCard({ menu, batch }: BatchCardProps) {
  const productionTime =
    batch === 1
      ? menu.batch1_production_time
      : batch === 2
        ? menu.batch2_production_time
        : menu.batch3_production_time;
  const deliveryStart =
    batch === 1
      ? menu.batch1_delivery_start
      : batch === 2
        ? menu.batch2_delivery_start
        : menu.batch3_delivery_start;
  const deliveryEnd =
    batch === 1
      ? menu.batch1_delivery_end
      : batch === 2
        ? menu.batch2_delivery_end
        : menu.batch3_delivery_end;
  const deliveryRange = formatTimeRange(deliveryStart, deliveryEnd);
  const delivered =
    batch === 1
      ? menu.batch1_delivered
      : batch === 2
        ? menu.batch2_delivered
        : menu.batch3_delivered;

  if (!productionTime && !deliveryRange) return null;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 card-hover animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              batch === 1
                ? "bg-blue-50 text-blue-600"
                : batch === 2
                  ? "bg-violet-50 text-violet-600"
                  : "bg-pink-50 text-pink-600",
            )}
          >
            <Package size={16} strokeWidth={2} />
          </div>
          <h3 className="text-sm font-bold text-foreground">Batch {batch}</h3>
        </div>

        {/* Delivery Status Badge */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            delivered ? "badge-safe" : "badge-warning",
          )}
        >
          {delivered ? (
            <CheckCircle2 size={13} strokeWidth={2.5} />
          ) : (
            <Timer size={13} strokeWidth={2.5} />
          )}
          {delivered ? "Sudah Dikirim" : "Menunggu"}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {/* Production */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
            <Clock
              size={14}
              strokeWidth={2}
              className="text-muted-foreground"
            />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
              Produksi
            </p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {productionTime || "—"} WIB
            </p>
          </div>
        </div>

        {/* Connector line */}
        <div className="ml-4 h-4 border-l-2 border-dashed border-border" />

        {/* Delivery */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              delivered ? "bg-emerald-50" : "bg-amber-50",
            )}
          >
            <Truck
              size={14}
              strokeWidth={2}
              className={delivered ? "text-emerald-600" : "text-amber-600"}
            />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
              Pengiriman
            </p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {deliveryRange || "—"} WIB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
