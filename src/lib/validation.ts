import type {
  BatchRecipient,
  NutrientKey,
  PortionKey,
} from "@/lib/supabase/types";
import { NUTRIENT_KEYS } from "@/lib/supabase/types";
import { PORTIONS } from "@/lib/constants";
import { MAX_RECIPIENTS_PER_BATCH } from "@/lib/beneficiaries";

export type BatchKey = "b1" | "b2" | "b3";

export interface BatchTimesInput {
  prod: string;
  delStart: string;
  delEnd: string;
  /**
   * Daftar penerima (sekolah) batch ini — satu batch boleh beberapa penerima,
   * masing-masing dengan jumlah porsinya sendiri.
   */
  recipients: BatchRecipient[];
}

export interface MenuFormInput {
  menuName: string;
  components: string[];
  beneficiaries: number;
  safeHours: number;
  nutritionist: string;
  batches: Record<BatchKey, BatchTimesInput>;
  nutrition: Record<PortionKey, Record<NutrientKey, string>>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateImageFile(file: File): ValidationResult {
  const errors: string[] = [];
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    errors.push("Format gambar tidak didukung. Harap gunakan file JPG, PNG, atau WebP.");
  }

  if (file.size > maxSize) {
    errors.push("Ukuran file gambar melebihi batas maksimal 5MB.");
  }

  return { valid: errors.length === 0, errors };
}

const BATCH_LABELS: Record<BatchKey, string> = {
  b1: "Batch 1",
  b2: "Batch 2",
  b3: "Batch 3",
};

const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  energy: "Energi",
  protein: "Protein",
  fat: "Lemak",
  carbs: "Karbohidrat",
  fiber: "Serat",
};

export function validateMenuInput(input: MenuFormInput): ValidationResult {
  const errors: string[] = [];

  // Menu Name
  if (!input.menuName || !input.menuName.trim()) {
    errors.push("Nama menu tidak boleh kosong.");
  } else if (input.menuName.trim().length > 200) {
    errors.push("Nama menu maksimal 200 karakter.");
  }

  // Menu Components
  if (!input.components || input.components.length === 0) {
    errors.push("Komponen menu minimal harus diisi 1 item.");
  }

  // Beneficiary Count
  if (isNaN(input.beneficiaries) || input.beneficiaries < 0) {
    errors.push("Jumlah penerima manfaat harus berupa angka non-negatif (>= 0).");
  } else if (input.beneficiaries > 100000) {
    errors.push("Jumlah penerima manfaat melebihi batas wajar (maks. 100.000).");
  }

  // Safe Hours
  if (isNaN(input.safeHours) || input.safeHours < 1 || input.safeHours > 24) {
    errors.push("Masa aman konsumsi harus di antara 1 - 24 jam.");
  }

  // Batch Time Logic — pengiriman berupa rentang (mulai - selesai), format 24 jam
  (Object.keys(BATCH_LABELS) as BatchKey[]).forEach((key) => {
    const { prod, delStart, delEnd, recipients } = input.batches[key];
    const label = BATCH_LABELS[key];

    if (prod && delStart && delStart < prod) {
      errors.push(
        `Rentang pengiriman ${label} tidak boleh dimulai sebelum jam produksi (${prod}).`,
      );
    }
    if (delStart && delEnd && delEnd < delStart) {
      errors.push(
        `Jam selesai pengiriman ${label} (${delEnd}) tidak boleh lebih awal dari jam mulai (${delStart}).`,
      );
    }

    // Daftar penerima (sekolah) per batch — baris kosong diabaikan,
    // sama seperti saat data disimpan.
    const rows = (recipients ?? []).filter(
      (r) => (r.school?.trim() ?? "") !== "" || Number(r.count) > 0,
    );

    if (rows.length > MAX_RECIPIENTS_PER_BATCH) {
      errors.push(
        `${label} maksimal ${MAX_RECIPIENTS_PER_BATCH} penerima (sekolah) dalam satu batch.`,
      );
    }

    const seenSchools = new Set<string>();
    rows.forEach((r, i) => {
      const school = (r.school ?? "").trim();
      const count = Number(r.count);
      const pos = `penerima ke-${i + 1}`;

      if (school.length > 120) {
        errors.push(`Nama sekolah ${label} ${pos} maksimal 120 karakter.`);
      }

      if (!Number.isFinite(count) || !Number.isInteger(count) || count < 0) {
        errors.push(
          `Jumlah porsi ${label} ${pos} harus berupa angka bulat non-negatif (>= 0).`,
        );
      } else if (count > 100000) {
        errors.push(
          `Jumlah porsi ${label} ${pos} melebihi batas wajar (maks. 100.000).`,
        );
      } else if (school && count === 0) {
        errors.push(`Jumlah porsi ${label} untuk “${school}” minimal 1 porsi.`);
      }

      if (!school) {
        errors.push(
          `Nama sekolah ${label} ${pos} wajib diisi karena jumlah porsinya ${count}.`,
        );
        return;
      }

      const dedupeKey = school.toLowerCase();
      if (seenSchools.has(dedupeKey)) {
        errors.push(
          `Nama sekolah “${school}” tercatat lebih dari sekali pada ${label}.`,
        );
      }
      seenSchools.add(dedupeKey);
    });
  });

  // Nutrition Validation (4 kategori porsi; angka non-negatif jika diisi)
  const checkNutrition = (val: string, label: string) => {
    if (val !== "" && val !== null && val !== undefined) {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        errors.push(`Nilai ${label} tidak boleh negatif atau tidak valid.`);
      } else if (num > 5000) {
        errors.push(`Nilai ${label} melebihi batas wajar (maks. 5000).`);
      }
    }
  };

  PORTIONS.forEach((portion) => {
    NUTRIENT_KEYS.forEach((n) => {
      checkNutrition(
        input.nutrition[portion.key][n],
        `${NUTRIENT_LABELS[n]} (${portion.short})`,
      );
    });
  });

  return { valid: errors.length === 0, errors };
}
