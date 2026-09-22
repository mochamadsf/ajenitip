"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Calendar,
  ImageIcon,
  Truck,
  Users,
  Timer,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyMenu } from "@/lib/supabase/types";
import {
  formatDateWIB,
  formatTimeRange,
  formatDurationCompact,
  formatTimeWIB,
  normalizeTimeShort,
  type SafetyStatus,
} from "@/lib/time";
import {
  BATCH_NUMBERS,
  getBatchSafety,
  type BatchNumber,
} from "@/lib/food-safety";

interface MenuHeroProps {
  menu: DailyMenu;
}

/** Warna chip batch — sejalan dengan Dashboard, Food Safety, & kartu batch. */
const BATCH_STYLES: Record<BatchNumber, { chip: string; card: string }> = {
  1: { chip: "bg-blue-600 text-white", card: "bg-blue-50/60 border-blue-100" },
  2: {
    chip: "bg-violet-600 text-white",
    card: "bg-violet-50/60 border-violet-100",
  },
  3: { chip: "bg-pink-600 text-white", card: "bg-pink-50/60 border-pink-100" },
};

/** Badge status — memakai kelas badge yang sama dengan Dashboard & Food Safety. */
const STATUS_BADGES: Record<SafetyStatus, string> = {
  AMAN: "badge-safe",
  PERINGATAN: "badge-warning",
  BAHAYA: "badge-danger",
};

const STATUS_TEXT_STYLES: Record<SafetyStatus, string> = {
  AMAN: "text-emerald-600",
  PERINGATAN: "text-amber-600",
  BAHAYA: "text-red-600",
};

const STATUS_BAR_STYLES: Record<SafetyStatus, string> = {
  AMAN: "bg-gradient-to-r from-emerald-500 to-teal-400",
  PERINGATAN: "bg-gradient-to-r from-amber-500 to-orange-400",
  BAHAYA: "bg-gradient-to-r from-red-500 to-rose-400",
};

const STATUS_ICONS: Record<SafetyStatus, typeof ShieldCheck> = {
  AMAN: ShieldCheck,
  PERINGATAN: ShieldAlert,
  BAHAYA: ShieldX,
};

/** Tingkat keparahan status — dipakai untuk mengambil status terburuk. */
const STATUS_SEVERITY: Record<SafetyStatus, number> = {
  AMAN: 0,
  PERINGATAN: 1,
  BAHAYA: 2,
};

export function MenuHeroCard({ menu }: MenuHeroProps) {
  const menuDate = new Date(menu.menu_date + "T00:00:00+07:00");

  // Satu jam bersama untuk seluruh kartu: hitungan mundur 3 batch diperbarui
  // tiap detik. `live` menandai render sudah berjalan di klien, sehingga nilai
  // yang bergantung pada waktu sekarang tidak berbeda saat hydration
  // (placeholder "--:--:--" dipakai pada render pertama).
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const live = now !== null;

  // Hitungan mundur tiap batch memakai rumus yang sama dengan card "Status
  // Keamanan" di Dashboard & halaman Food Safety: jam produksi batch +
  // menu.safe_hours (helper bersama @/lib/food-safety).
  const batches = BATCH_NUMBERS.map((batch) => {
    const { productionTime, remainingSeconds, status, progress } =
      getBatchSafety(menu, batch);

    return {
      batch,
      productionTime,
      // Jam mulai saja untuk layar sempit (tile batch 3 kolom di mobile)
      deliveryStart: normalizeTimeShort(menu[`batch${batch}_delivery_start`]),
      deliveryRange: formatTimeRange(
        menu[`batch${batch}_delivery_start`],
        menu[`batch${batch}_delivery_end`],
      ),
      delivered: Boolean(menu[`batch${batch}_delivered`]),
      remainingSeconds: Math.max(0, remainingSeconds),
      status,
      progress,
    };
  });

  // Badge pada foto: status terburuk dari batch yang sudah dijadwalkan, sehingga
  // badge tidak lagi selalu "AMAN" (sebelumnya statis) — null = belum ada jadwal.
  const scheduledBatches = batches.filter((b) => b.productionTime);
  const overallStatus: SafetyStatus | null = scheduledBatches.length
    ? scheduledBatches.reduce<SafetyStatus>(
        (worst, b) =>
          STATUS_SEVERITY[b.status] > STATUS_SEVERITY[worst] ? b.status : worst,
        "AMAN",
      )
    : null;
  const OverallStatusIcon = overallStatus ? STATUS_ICONS[overallStatus] : null;

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-border overflow-hidden shadow-sm animate-fade-in flex flex-col lg:flex-row">
      {/* ── Banner foto: ringkas di mobile (h-44), kolom kiri di desktop ── */}
      <div className="relative w-full h-44 sm:h-56 lg:h-auto lg:w-[40%] lg:min-h-[300px] shrink-0 bg-surface overflow-hidden">
        {menu.photo_url ? (
          <Image
            src={menu.photo_url}
            alt={`Foto menu ${menu.menu_name}`}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 1023px) 100vw, 40vw"
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          /* Tanpa foto: banner tetap gelap bernuansa brand agar chip & judul
             putih di atasnya tetap kontras (bukan abu-abu polos). */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white/70">
            <ImageIcon size={32} strokeWidth={1.5} />
            <span className="text-xs font-medium">Foto Menu</span>
          </div>
        )}

        {/* Gradasi overlay: chip & judul tetap terbaca di atas foto apa pun */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/10"
        />

        {/* Status keamanan — status terburuk dari batch yang terjadwal */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          {overallStatus && OverallStatusIcon ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm",
                STATUS_BADGES[overallStatus],
              )}
            >
              <OverallStatusIcon size={12} strokeWidth={2.4} />
              {overallStatus}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-slate-600 border border-white/60 shadow-sm">
              <Clock size={12} strokeWidth={2.4} />
              Belum dijadwalkan
            </span>
          )}
        </div>

        {/* Judul (mobile) + tanggal & jam WIB live */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col gap-2">
          <h2 className="lg:hidden text-lg sm:text-2xl font-bold text-white leading-snug line-clamp-2 drop-shadow-sm">
            {menu.menu_name}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/25 text-[10px] font-bold text-white">
              <Calendar size={11} strokeWidth={2.4} />
              {formatDateWIB(menuDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/25 text-[10px] font-bold text-white tabular-nums">
              <Clock size={11} strokeWidth={2.4} />
              {now ? `${formatTimeWIB(now)} WIB` : "--:--:-- WIB"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Info menu ── */}
      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col gap-4">
        <h2 className="hidden lg:block text-2xl font-bold text-foreground leading-tight">
          {menu.menu_name}
        </h2>

        {/* Ringkasan cepat: porsi disiapkan & masa aman konsumsi */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {menu.beneficiary_count > 0 && (
            <div className="flex flex-1 min-w-[140px] items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <Users size={15} strokeWidth={2.2} className="text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground truncate">
                  Porsi Disiapkan
                </p>
                <p className="text-base font-bold text-foreground tabular-nums leading-tight">
                  {menu.beneficiary_count.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-1 min-w-[140px] items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Timer size={15} strokeWidth={2.2} className="text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground truncate">
                Batas Konsumsi
              </p>
              <p className="text-base font-bold text-foreground tabular-nums leading-tight">
                {menu.safe_hours} Jam
              </p>
            </div>
          </div>
        </div>

        {/* Hitungan mundur per batch — rumus sama dengan card "Status Keamanan"
            di Dashboard & halaman Food Safety: jam produksi batch + safe_hours.
            Grid 3 kolom sejak mobile agar kartu tetap ringkas, bukan bertumpuk. */}
        <div className="mt-auto pt-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
              <ShieldCheck
                size={13}
                strokeWidth={2.4}
                className="text-primary shrink-0"
              />
              Sisa Waktu Aman
            </h3>
            <span className="text-[10px] font-semibold text-muted-foreground">
              Masa aman {menu.safe_hours} jam
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {batches.map((b) => {
              const style = BATCH_STYLES[b.batch];
              const StatusIcon = STATUS_ICONS[b.status];
              const scheduled = Boolean(b.productionTime);

              return (
                <div
                  key={b.batch}
                  className={cn(
                    "rounded-xl border p-2 sm:p-2.5 flex flex-col min-w-0",
                    style.card,
                  )}
                >
                  {/* Header tile: nomor batch + status (label teks hanya ≥ sm) */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none",
                        style.chip,
                      )}
                      aria-label={`Batch ${b.batch}`}
                    >
                      B{b.batch}
                    </span>

                    {scheduled ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold leading-none",
                          STATUS_TEXT_STYLES[b.status],
                        )}
                        title={b.status}
                      >
                        <StatusIcon size={11} strokeWidth={2.4} />
                        <span className="hidden sm:inline">{b.status}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold leading-none text-muted-foreground">
                        —
                      </span>
                    )}
                  </div>

                  {scheduled ? (
                    <>
                      {/* Hitung mundur live — placeholder pada render pertama */}
                      <p
                        className={cn(
                          "text-[13px] sm:text-lg font-black font-mono tabular-nums leading-none",
                          STATUS_TEXT_STYLES[b.status],
                        )}
                      >
                        {live
                          ? formatDurationCompact(b.remainingSeconds)
                          : "--:--:--"}
                      </p>

                      <div className="mt-1.5 h-1 w-full rounded-full bg-white/80 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-linear",
                            STATUS_BAR_STYLES[b.status],
                          )}
                          style={{
                            width: live
                              ? `${Math.round(b.progress * 100)}%`
                              : "0%",
                          }}
                        />
                      </div>

                      {/* Pengiriman: jam mulai di mobile, rentang penuh di layar lebar */}
                      <p className="mt-1.5 flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-foreground/80 min-w-0">
                        <Truck
                          size={10}
                          strokeWidth={2.2}
                          className={cn(
                            "shrink-0",
                            b.delivered
                              ? "text-emerald-500"
                              : "text-orange-500",
                          )}
                        />
                        <span className="truncate sm:hidden">
                          {b.deliveryStart || "—"}
                        </span>
                        <span className="hidden sm:inline truncate">
                          {b.deliveryRange || "Belum dijadwalkan"}
                        </span>
                      </p>

                      <p className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground min-w-0">
                        <Clock size={10} strokeWidth={2.2} className="shrink-0" />
                        <span className="truncate">
                          <span className="hidden sm:inline">Produksi </span>
                          {b.productionTime
                            ? `${b.productionTime.slice(0, 5)} WIB`
                            : "—"}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Belum dijadwalkan
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ahli gizi penyusun menu (bila diisi dari panel admin) */}
        {menu.nutritionist_name && (
          <p className="text-[11px] text-muted-foreground">
            Ahli Gizi:{" "}
            <span className="font-semibold text-foreground">
              {menu.nutritionist_name}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
