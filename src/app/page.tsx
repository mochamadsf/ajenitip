"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UtensilsCrossed,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { useTodayMenu, useKitchenConfig } from "@/lib/supabase/hooks";
import {
  formatTimeWIB,
  formatDateWIB,
  getSafetyStatus,
  calculateRemainingSeconds,
  formatDuration,
  parseTimeOnDate,
} from "@/lib/time";
import { CardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SafetyStatus } from "@/lib/time";

const STATUS_STYLES: Record<SafetyStatus, string> = {
  AMAN: "badge-safe",
  PERINGATAN: "badge-warning",
  BAHAYA: "badge-danger",
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

  // Calculate safety status
  let safetyStatus: SafetyStatus = "AMAN";
  let remainingText = "";
  if (menu) {
    const deliveryTime =
      menu.batch3_delivery_end ||
      menu.batch2_delivery_end ||
      menu.batch1_delivery_end;
    if (deliveryTime) {
      const deliveryDate = parseTimeOnDate(deliveryTime, menu.menu_date);
      const rem = calculateRemainingSeconds(deliveryDate, menu.safe_hours);
      safetyStatus = getSafetyStatus(rem, menu.safe_hours * 3600);
      remainingText = formatDuration(Math.max(0, rem));
    }
  }

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
                      Monitoring Waktu
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Status Saat Ini:
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                      STATUS_STYLES[safetyStatus],
                    )}
                  >
                    {safetyStatus}
                  </span>
                </div>
                {remainingText ? (
                  <div className="bg-surface rounded-xl p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Sisa waktu aman (Maks {menu?.safe_hours} Jam):
                    </p>
                    <p className="text-lg font-bold text-foreground font-mono leading-snug whitespace-pre-line">
                      {remainingText
                        .replace(/ (jam|menit|detik)/g, " $1\n")
                        .trim()}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Belum ada pengiriman aktif hari ini.
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
                    <p className="text-sm text-foreground font-bold line-clamp-1 mb-2">
                      {menu.menu_name}
                    </p>
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
                    Belum ada menu untuk hari ini.
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
      </div>
    </MainLayout>
  );
}
