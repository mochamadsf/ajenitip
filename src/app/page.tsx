"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Package,
  UtensilsCrossed,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  Flame,
  Beef,
  Droplets,
  Wheat,
  Leaf,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { useTodayMenu, useKitchenConfig } from "@/lib/supabase/hooks";
import { formatTimeWIB, formatDateWIB, formatDurationCompact, formatDateShortWIB } from "@/lib/time";
import { getBatchesSafety } from "@/lib/food-safety";
import { CardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { NUTRITION_LABELS, NUTRITION_UNITS, PORTIONS } from "@/lib/constants";
import {
  NUTRIENT_KEYS,
  getPortionNutrition,
  type NutrientKey,
} from "@/lib/supabase/types";
import type { SafetyStatus } from "@/lib/time";

const STATUS_STYLES: Record<SafetyStatus, string> = {
  AMAN: "badge-safe",
  PERINGATAN: "badge-warning",
  BAHAYA: "badge-danger",
};

const STATUS_TEXT_STYLES: Record<SafetyStatus, string> = {
  AMAN: "text-emerald-600",
  PERINGATAN: "text-amber-600",
  BAHAYA: "text-red-600",
};

const STATUS_ICONS: Record<SafetyStatus, typeof ShieldCheck> = {
  AMAN: ShieldCheck,
  PERINGATAN: ShieldAlert,
  BAHAYA: ShieldX,
};

/** Warna chip label batch — sama dengan halaman Food Safety. */
const BATCH_CHIP_STYLES: Record<1 | 2 | 3, string> = {
  1: "bg-blue-50 text-blue-600",
  2: "bg-violet-50 text-violet-600",
  3: "bg-pink-50 text-pink-600",
};

/** Ikon & warna zat gizi — sejalan dengan tabel gizi di halaman Menu Hari Ini. */
const NUTRIENT_ICONS: Record<NutrientKey, typeof Flame> = {
  energy: Flame,
  protein: Beef,
  fat: Droplets,
  carbs: Wheat,
  fiber: Leaf,
};

const NUTRIENT_TEXT_COLORS: Record<NutrientKey, string> = {
  energy: "text-orange-500",
  protein: "text-red-500",
  fat: "text-amber-500",
  carbs: "text-blue-500",
  fiber: "text-emerald-500",
};

export default function DashboardPage() {
  const { menu, loading } = useTodayMenu();
  const { config } = useKitchenConfig();
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const update = () => {
      setMounted(true);
      setTime(formatTimeWIB());
      setDate(formatDateWIB());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Status keamanan 3 batch — rumus sama dengan halaman Food Safety:
  // jam produksi tiap batch + safe_hours (4 jam setelah produksi).
  // Dihitung saat render; clock di atas me-render ulang tiap detik agar live.
  const batchSafety = menu ? getBatchesSafety(menu) : [];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {config?.kitchen_name || "Dapur SPPG"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
            {mounted && (
              <>
                <span className="text-sm">{date}</span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1.5 text-sm">
                  <Clock size={14} strokeWidth={2} />
                  <span className="tabular-nums font-medium">{time} WIB</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Food Safety Card */}
            <Link
              href="/food-safety"
              className="bg-white rounded-2xl border border-border p-6 card-hover animate-slide-up stagger-1 group flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck
                      size={24}
                      strokeWidth={2}
                      className="text-emerald-600"
                    />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Status Keamanan
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Monitoring 3 Batch
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <div className="flex-1 flex flex-col justify-end">
                {menu ? (
                  <>
                    {/* Countdown 3 batch: jam produksi tiap batch + safe_hours */}
                    <div className="space-y-2">
                      {batchSafety.map((b) => {
                        const StatusIcon = STATUS_ICONS[b.status];
                        return (
                          <div
                            key={b.batch}
                            className="bg-surface rounded-xl p-2.5 border border-border"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold",
                                  BATCH_CHIP_STYLES[b.batch],
                                )}
                              >
                                <Package size={11} strokeWidth={2.5} />
                                Batch {b.batch}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  STATUS_STYLES[b.status],
                                )}
                              >
                                <StatusIcon size={11} strokeWidth={2.2} />
                                {b.status}
                              </span>
                            </div>

                            {b.productionTime ? (
                              <div className="flex items-end justify-between gap-2">
                                <p className="text-[10px] text-muted-foreground">
                                  Produksi {b.productionTime.slice(0, 5)} WIB
                                </p>
                                <p
                                  className={cn(
                                    "text-sm font-bold font-mono leading-none tabular-nums",
                                    STATUS_TEXT_STYLES[b.status],
                                  )}
                                >
                                  {formatDurationCompact(
                                    Math.max(0, b.remainingSeconds),
                                  )}
                                </p>
                              </div>
                            ) : (
                              <p className="text-[10px] text-muted-foreground">
                                Belum dijadwalkan
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-3">
                      Masa aman {menu.safe_hours} jam setelah produksi tiap batch
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Belum ada data batch.
                  </p>
                )}
              </div>
            </Link>

            {/* Menu Today Card */}
            <Link
              href="/menu-hari-ini"
              className="bg-white rounded-2xl border border-border p-6 card-hover animate-slide-up stagger-2 group flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <UtensilsCrossed
                      size={24}
                      strokeWidth={2}
                      className="text-blue-600"
                    />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Menu Hari Ini
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Detail Makanan
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <div className="flex-1 flex flex-col justify-end">
                {menu ? (
                  <>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm text-foreground font-bold line-clamp-1">
                        {menu.menu_name}
                      </p>
                      {/* Tanggal data menu — penting karena bila menu hari ini belum
                          ada, menu terakhir yang ditampilkan. */}
                      <span className="text-[10px] font-semibold text-muted-foreground shrink-0">
                        {formatDateShortWIB(
                          new Date(menu.menu_date + "T00:00:00+07:00"),
                        )}
                      </span>
                    </div>
                    <ul className="space-y-1.5 mb-4">
                      {menu.menu_components.slice(0, 2).map((comp, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <div className="w-1 h-1 rounded-full bg-blue-400" />
                          <span className="line-clamp-1">{comp}</span>
                        </li>
                      ))}
                      {menu.menu_components.length > 2 && (
                        <li className="text-[10px] text-muted-foreground pl-3 italic">
                          + {menu.menu_components.length - 2} komponen lainnya
                        </li>
                      )}
                    </ul>

                    {/* Status Produksi & Pengiriman */}
                    <div className="bg-surface rounded-xl p-3 border border-border mt-auto">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Status Distribusi
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">
                            Batch 1
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                menu.batch1_delivered
                                  ? "bg-emerald-500"
                                  : "bg-orange-500",
                              )}
                            />
                            <span className="text-[11px] font-semibold text-foreground">
                              {menu.batch1_delivered ? "Terkirim" : "Produksi"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">
                            Batch 2
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                menu.batch2_delivered
                                  ? "bg-emerald-500"
                                  : "bg-orange-500",
                              )}
                            />
                            <span className="text-[11px] font-semibold text-foreground">
                              {menu.batch2_delivered ? "Terkirim" : "Produksi"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">
                            Batch 3
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                menu.batch3_delivered
                                  ? "bg-emerald-500"
                                  : "bg-orange-500",
                              )}
                            />
                            <span className="text-[11px] font-semibold text-foreground">
                              {menu.batch3_delivered ? "Terkirim" : "Produksi"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground flex-1">
                    Belum ada data menu.
                  </p>
                )}
              </div>
            </Link>

            {/* Beneficiaries Card */}
            <div className="bg-white rounded-2xl border border-border p-6 animate-slide-up stagger-3 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Users
                    size={24}
                    strokeWidth={2}
                    className="text-violet-600"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Penerima Manfaat
                  </h2>
                  <p className="text-xs text-muted-foreground">Total Porsi</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-end">
                {menu ? (
                  <>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-black text-foreground tabular-nums leading-none">
                        {menu.beneficiary_count.toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">
                        Anak
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit mt-2">
                      <TrendingUp size={14} />
                      <span className="font-medium">
                        Jadwal distribusi aktif
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Data belum tersedia.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Quick Info Banner */}
        {menu && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden animate-slide-up stagger-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Masa Aman Konsumsi
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {menu.safe_hours} Jam setelah dikirim
                  </p>
                </div>
              </div>
              <div className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Ahli Gizi Bertugas
                  </p>
                  <p className="text-sm font-bold text-foreground line-clamp-1">
                    {menu.nutritionist_name || "Belum Ditentukan"}
                  </p>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between gap-4 bg-surface/50">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Informasi Gizi
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {menu.energy_balita
                      ? `${menu.energy_balita} kkal (Porsi Kecil - Balita)`
                      : "Lihat Detail Gizi"}
                  </p>
                </div>
                <Link
                  href="/menu-hari-ini"
                  className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center hover:bg-surface transition-colors flex-shrink-0"
                >
                  <ArrowRight size={16} className="text-foreground" />
                </Link>
              </div>
            </div>
          </div>
        )}
        {/* Ringkasan Informasi Gizi — 5 zat gizi × 4 kategori porsi */}
        {menu && (
          <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 animate-slide-up stagger-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Flame size={20} strokeWidth={2} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Ringkasan Informasi Gizi
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {menu.menu_name} ·{" "}
                    {formatDateShortWIB(
                      new Date(menu.menu_date + "T00:00:00+07:00"),
                    )}
                  </p>
                </div>
              </div>
              <Link
                href="/menu-hari-ini"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Detail Lengkap
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left pb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Zat Gizi
                    </th>
                    {PORTIONS.map((p) => {
                      const PortionIcon = p.icon;
                      return (
                        <th key={p.key} className="pb-3 px-1.5 align-bottom">
                          <span
                            className={cn(
                              "inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold leading-tight",
                              p.chip,
                            )}
                          >
                            <span className="flex items-center gap-1">
                              <PortionIcon size={11} strokeWidth={2.4} />
                              {p.group}
                            </span>
                            <span className="font-semibold opacity-80">
                              {p.short}
                            </span>
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {NUTRIENT_KEYS.map((key) => {
                    const NutrientIcon = NUTRIENT_ICONS[key];
                    return (
                      <tr key={key} className="border-t border-border">
                        <td className="py-2.5 pr-2">
                          <span className="flex items-center gap-2 text-xs font-semibold text-foreground whitespace-nowrap">
                            <NutrientIcon
                              size={14}
                              strokeWidth={2}
                              className={NUTRIENT_TEXT_COLORS[key]}
                            />
                            {NUTRITION_LABELS[key]}
                            <span className="text-[10px] font-normal text-muted-foreground">
                              ({NUTRITION_UNITS[key]})
                            </span>
                          </span>
                        </td>
                        {PORTIONS.map((p) => {
                          const value = getPortionNutrition(menu, p.key)[key];
                          return (
                            <td key={p.key} className="py-2.5 px-1.5 text-center">
                              <span
                                className={cn(
                                  "text-sm font-bold tabular-nums",
                                  value == null
                                    ? "text-muted-foreground/50"
                                    : "text-foreground",
                                )}
                              >
                                {value ?? "—"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-muted-foreground mt-3">
              Nilai gizi per porsi untuk 4 kategori penerima. Tanda “—” berarti
              data belum diisi.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
