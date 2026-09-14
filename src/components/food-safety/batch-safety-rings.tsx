"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Clock, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatTimeWIB,
  formatDurationCompact,
  type SafetyStatus,
} from "@/lib/time";
import { getBatchSafety, type BatchNumber } from "@/lib/food-safety";
import type { DailyMenu } from "@/lib/supabase/types";

interface BatchSafetyRingsProps {
  menu: DailyMenu;
}

const STATUS_CONFIG: Record<
  SafetyStatus,
  {
    icon: typeof ShieldCheck;
    label: string;
    color: string;
    bgClass: string;
    ringColor: string;
  }
> = {
  AMAN: {
    icon: ShieldCheck,
    label: "AMAN",
    color: "text-emerald-600",
    bgClass: "badge-safe",
    ringColor: "#22c55e",
  },
  PERINGATAN: {
    icon: ShieldAlert,
    label: "PERINGATAN",
    color: "text-amber-600",
    bgClass: "badge-warning",
    ringColor: "#f59e0b",
  },
  BAHAYA: {
    icon: ShieldX,
    label: "BAHAYA",
    color: "text-red-600",
    bgClass: "badge-danger",
    ringColor: "#ef4444",
  },
};

const BATCH_STYLES: Record<1 | 2 | 3, string> = {
  1: "bg-blue-50 text-blue-600",
  2: "bg-violet-50 text-violet-600",
  3: "bg-pink-50 text-pink-600",
};

interface BatchRingProps {
  menu: DailyMenu;
  batch: BatchNumber;
}

function BatchRing({ menu, batch }: BatchRingProps) {
  // Recomputed on every render — the parent re-renders each second via the shared clock.
  // Rumus diambil dari helper bersama: jam produksi batch + menu.safe_hours.
  const { productionTime, status, remainingSeconds, progress } = getBatchSafety(
    menu,
    batch,
  );
  const remaining = Math.max(0, remainingSeconds);

  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  // SVG ring calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex flex-col items-center text-center animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 w-full mb-3">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            BATCH_STYLES[batch],
          )}
        >
          <Package size={16} strokeWidth={2} />
        </div>
        <h3 className="text-sm font-bold text-foreground">Batch {batch}</h3>
      </div>

      {/* Status Badge */}
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3",
          config.bgClass,
        )}
      >
        <StatusIcon size={13} strokeWidth={2.2} />
        {config.label}
      </div>

      {/* Ring Timer */}
      <div className="relative w-32 h-32 mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={config.ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
            style={{ filter: `drop-shadow(0 0 6px ${config.ringColor}40)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-muted-foreground font-medium mb-1">
            Sisa Waktu Aman
          </span>
          <span
            className={cn(
              "text-base font-bold tabular-nums tracking-tight",
              config.color,
            )}
          >
            {formatDurationCompact(remaining)}
          </span>
        </div>
      </div>

      {/* Production time reference */}
      <p className="text-[11px] text-muted-foreground">
        Dari produksi {productionTime ? productionTime.slice(0, 5) : "—"} WIB ·{" "}
        {menu.safe_hours} jam
      </p>
    </div>
  );
}

export function BatchSafetyRings({ menu }: BatchSafetyRingsProps) {
  // Single shared ticking clock — one interval & one real-time display for the whole card
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white rounded-2xl border border-border p-6 sm:p-8 card-hover animate-fade-in">
      {/* Card header: title + single real-time clock */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-foreground">
          Status Keamanan per Batch
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={14} strokeWidth={2} />
          <span className="text-sm font-medium tabular-nums">
            {formatTimeWIB(now)} WIB
          </span>
        </div>
      </div>

      {/* Countdown dihitung dari waktu produksi tiap batch + safe_hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BatchRing menu={menu} batch={1} />
        <BatchRing menu={menu} batch={2} />
        <BatchRing menu={menu} batch={3} />
      </div>
    </section>
  );
}

