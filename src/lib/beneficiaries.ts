/**
 * Data penerima manfaat per batch — single source of truth.
 *
 * Setiap batch pengiriman punya **daftar penerima** (sekolah) beserta jumlah
 * porsi masing-masing. Satu batch boleh berisi beberapa penerima; datanya
 * disimpan di kolom JSONB `batch{n}_recipients` (`[{ school, count }, ...]`)
 * dan diisi admin di panel admin → Kelola Menu.
 *
 * Kolom lama (`batch{n}_school_name` & `batch{n}_beneficiary_count`) tetap
 * didukung sebagai fallback dan tetap diisi otomatis saat menyimpan, sehingga
 * baris menu lama tetap tampil benar.
 */

import type { BatchRecipient, DailyMenu } from "@/lib/supabase/types";
import { BATCH_NUMBERS, type BatchNumber } from "@/lib/food-safety";

/** Batas jumlah penerima (sekolah) dalam satu batch. */
export const MAX_RECIPIENTS_PER_BATCH = 10;

/**
 * Normalisasi daftar penerima (dari kolom JSONB maupun state form):
 * nama di-trim, porsi dibulatkan ke bilangan bulat ≥ 0, dan baris kosong
 * (nama kosong & porsi 0) dibuang.
 */
export function normalizeRecipients(value: unknown): BatchRecipient[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const raw = (item ?? {}) as Record<string, unknown>;
      const school = String(raw.school ?? "").trim();
      const count = Math.max(0, Math.trunc(Number(raw.count) || 0));
      return { school, count };
    })
    .filter((r) => r.school !== "" || r.count > 0);
}

/** Total porsi dari daftar penerima. */
export function getRecipientTotal(recipients: BatchRecipient[]): number {
  return recipients.reduce((sum, r) => sum + r.count, 0);
}

/**
 * Ringkasan nama sekolah untuk kolom lama `batch{n}_school_name`
 * (diisi otomatis saat menyimpan agar data tetap kompatibel ke belakang).
 */
export function getSchoolNamesSummary(
  recipients: BatchRecipient[],
): string | null {
  const names = recipients.map((r) => r.school).filter(Boolean);
  return names.length ? names.join(", ") : null;
}

/**
 * Daftar penerima satu batch: pakai kolom JSONB bila sudah ada isinya, dan
 * fallback ke kolom lama (nama sekolah tunggal + jumlah porsi) bila belum.
 */
export function getBatchRecipients(
  menu: DailyMenu,
  batch: BatchNumber,
): BatchRecipient[] {
  const stored = normalizeRecipients(menu[`batch${batch}_recipients`]);
  if (stored.length > 0) return stored;

  const legacySchool = menu[`batch${batch}_school_name`]?.trim() || "";
  const legacyCount = menu[`batch${batch}_beneficiary_count`] ?? 0;
  if (!legacySchool && legacyCount <= 0) return [];

  return [{ school: legacySchool, count: Math.max(0, legacyCount) }];
}

export interface BatchBeneficiary {
  batch: BatchNumber;
  /** Daftar penerima (sekolah) batch ini — bisa lebih dari satu */
  recipients: BatchRecipient[];
  /** Jumlah sekolah/penerima pada batch ini */
  schoolCount: number;
  /** Total porsi batch ini (Σ porsi seluruh penerima) */
  count: number;
}

/** Rincian penerima manfaat untuk Batch 1, 2, dan 3. */
export function getBatchBeneficiaries(menu: DailyMenu): BatchBeneficiary[] {
  return BATCH_NUMBERS.map((batch) => {
    const recipients = getBatchRecipients(menu, batch);
    return {
      batch,
      recipients,
      schoolCount: recipients.length,
      count: getRecipientTotal(recipients),
    };
  });
}

/**
 * Total porsi penerima manfaat.
 *
 * Sumber utama adalah `beneficiary_count` (kolom total yang diisi admin).
 * Bila kosong/0 sementara rincian batch sudah ada, jumlah porsi batch
 * dijadikan fallback supaya card tetap menampilkan angka yang benar.
 */
export function getTotalBeneficiaries(menu: DailyMenu): number {
  if (menu.beneficiary_count > 0) return menu.beneficiary_count;

  return getBatchBeneficiaries(menu).reduce((sum, b) => sum + b.count, 0);
}
