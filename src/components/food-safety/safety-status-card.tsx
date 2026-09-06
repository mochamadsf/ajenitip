"use client";

import { useEffect, useState, useMemo } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatTimeWIB,
  calculateRemainingSeconds,
  formatDurationCompact,
  getSafetyStatus,
  getProgressRatio,
  parseTimeOnDate,
  type SafetyStatus,
} from "@/lib/time";
import type { DailyMenu } from "@/lib/supabase/types";

interface RingTimerProps {
  menu: DailyMenu;
}

const STATUS_CONFIG: Record<
  SafetyStatus,
  { icon: typeof ShieldCheck; label: string; color: string; bgClass: string; ringColor: string }
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

export function SafetyStatusCard({ menu }: RingTimerProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { status, remaining, total, progress, timeDisplay } = useMemo(() => {
    // Use the latest delivery time to calculate safety
    const deliveryTime = menu.batch2_delivery_time || menu.batch1_delivery_time;
    if (!deliveryTime) {
      return {
        status: "AMAN" as SafetyStatus,
        remaining: 0,
        total: 0,
        progress: 1,
        timeDisplay: formatTimeWIB(now),
      };
    }

    const deliveryDate = parseTimeOnDate(deliveryTime, menu.menu_date);
    const totalSafe = menu.safe_hours * 3600;
    const rem = calculateRemainingSeconds(deliveryDate, menu.safe_hours);
    const stat = getSafetyStatus(rem, totalSafe);
    const prog = getProgressRatio(rem, totalSafe);

    return {
      status: stat,
      remaining: Math.max(0, rem),
      total: totalSafe,
      progress: prog,
      timeDisplay: formatTimeWIB(now),
    };
  }, [now, menu]);

  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  // SVG ring calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 card-hover animate-fade-in">
      <div className="flex flex-col items-center text-center">
        {/* Status Badge */}
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6",
            config.bgClass
          )}
        >
          <StatusIcon size={18} strokeWidth={2.2} />
          Status: {config.label}
        </div>

        {/* Ring Timer */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-6">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 200 200"
          >
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="8"
            />
            {/* Progress ring */}
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
            <span className="text-xs text-muted-foreground font-medium mb-1">
              Sisa Waktu Aman
            </span>
            <span
              className={cn(
                "text-2xl sm:text-3xl font-bold tabular-nums tracking-tight",
                config.color
              )}
            >
              {formatDurationCompact(remaining)}
            </span>
            <span className="text-[11px] text-muted-foreground mt-1">
              dari {menu.safe_hours} jam
            </span>
          </div>
        </div>

        {/* Current Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={14} strokeWidth={2} />
          <span className="text-sm font-medium tabular-nums">
            {timeDisplay} WIB
          </span>
        </div>
      </div>
    </div>
  );
}
