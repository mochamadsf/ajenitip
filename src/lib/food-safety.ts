/**
 * Perhitungan status keamanan pangan per batch — single source of truth.
 *
 * Rumus: waktu aman dihitung dari **jam produksi** tiap batch + `menu.safe_hours`
 * (default 4 jam). Dipakai bersama oleh halaman Food Safety dan card
 * "Status Keamanan" di Dashboard agar keduanya selalu memakai rumus yang sama.
 */

import type { DailyMenu } from "@/lib/supabase/types";
import {
  calculateRemainingSeconds,
  getProgressRatio,
  getSafetyStatus,
  parseTimeOnDate,
  type SafetyStatus,
} from "@/lib/time";

export type BatchNumber = 1 | 2 | 3;

/** Urutan batch yang ditampilkan di UI. */
export const BATCH_NUMBERS: readonly BatchNumber[] = [1, 2, 3] as const;

export interface BatchSafety {
  batch: BatchNumber;
  /** Jam produksi "HH:MM"; null bila batch belum dijadwalkan */
  productionTime: string | null;
  /** Sisa detik sampai masa aman habis; negatif bila sudah lewat */
  remainingSeconds: number;
  status: SafetyStatus;
  /** 1 = jendela waktu aman masih penuh, 0 = habis */
  progress: number;
}

/** Ambil jam produksi satu batch dari baris menu. */
export function getBatchProductionTime(
  menu: DailyMenu,
  batch: BatchNumber,
): string | null {
  return batch === 1
    ? menu.batch1_production_time
    : batch === 2
      ? menu.batch2_production_time
      : menu.batch3_production_time;
}

/**
 * Hitung status keamanan satu batch dari jam produksinya + `menu.safe_hours`.
 * Batch tanpa jam produksi belum dijadwalkan: sisa waktu 0 & progress 0
 * (ring kosong di halaman Food Safety, ditampilkan sebagai "Belum dijadwalkan"
 * di Dashboard).
 */
export function getBatchSafety(
  menu: DailyMenu,
  batch: BatchNumber,
): BatchSafety {
  const productionTime = getBatchProductionTime(menu, batch);

  if (!productionTime) {
    return {
      batch,
      productionTime: null,
      remainingSeconds: 0,
      status: "AMAN",
      progress: 0,
    };
  }

  const productionDate = parseTimeOnDate(productionTime, menu.menu_date);
  const totalSafeSeconds = menu.safe_hours * 3600;
  const remainingSeconds = calculateRemainingSeconds(
    productionDate,
    menu.safe_hours,
  );

  return {
    batch,
    productionTime,
    remainingSeconds,
    status: getSafetyStatus(remainingSeconds, totalSafeSeconds),
    progress: getProgressRatio(remainingSeconds, totalSafeSeconds),
  };
}

/** Status keamanan seluruh batch (Batch 1, 2, 3) untuk satu menu. */
export function getBatchesSafety(menu: DailyMenu): BatchSafety[] {
  return BATCH_NUMBERS.map((batch) => getBatchSafety(menu, batch));
}