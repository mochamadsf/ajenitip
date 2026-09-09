"use client";

import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

interface TimeSelectProps {
  /** Nilai terpilih "HH:MM" (24 jam) atau "" jika kosong */
  value: string;
  onChange: (value: string) => void;
  /** Label untuk aksesibilitas */
  label: string;
  className?: string;
}

/**
 * Pemilih waktu format 24 jam (00:00 - 23:55) berbasis dropdown,
 * agar tampilan konsisten 24 jam di semua browser/lokal.
 * Granularitas menit 5 menit; menit lama yang tidak kelipatan 5 tetap ditampilkan.
 */
export function TimeSelect({ value, onChange, label, className }: TimeSelectProps) {
  const parts = value ? value.split(":") : [];
  const h = parts[0] ?? "";
  const m = parts[1] ?? "";
  const minuteOptions =
    m && !MINUTES.includes(m) ? [...MINUTES, m].sort() : MINUTES;

  const emit = (nh: string, nm: string) => {
    onChange(nh && nm ? `${nh}:${nm}` : "");
  };

  const selectCls =
    "w-full appearance-none rounded-lg border border-border bg-white px-1.5 py-1.5 text-center text-sm font-semibold tabular-nums text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <select
        aria-label={`${label} — jam`}
        value={h}
        onChange={(e) => emit(e.target.value, m || "00")}
        className={selectCls}
      >
        <option value="">--</option>
        {HOURS.map((hh) => (
          <option key={hh} value={hh}>
            {hh}
          </option>
        ))}
      </select>
      <span className="text-sm font-bold text-muted-foreground">:</span>
      <select
        aria-label={`${label} — menit`}
        value={m}
        onChange={(e) => emit(h, e.target.value)}
        disabled={!h}
        className={cn(selectCls, !h && "opacity-50 cursor-not-allowed")}
      >
        <option value="">--</option>
        {minuteOptions.map((mm) => (
          <option key={mm} value={mm}>
            {mm}
          </option>
        ))}
      </select>
    </div>
  );
}