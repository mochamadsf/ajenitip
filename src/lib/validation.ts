export interface MenuFormInput {
  menuName: string;
  components: string[];
  beneficiaries: number;
  safeHours: number;
  nutritionist: string;
  b1Prod: string;
  b1Del: string;
  b2Prod: string;
  b2Del: string;
  b3Prod: string;
  b3Del: string;
  eSmall: string;
  pSmall: string;
  fSmall: string;
  cSmall: string;
  fiSmall: string;
  eLarge: string;
  pLarge: string;
  fLarge: string;
  cLarge: string;
  fiLarge: string;
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

  // Batch Time Logic Validation (Delivery time must be after production time if both provided)
  const validateBatchTimes = (prod: string, del: string, batchName: string) => {
    if (prod && del) {
      if (del < prod) {
        errors.push(`Jam pengiriman ${batchName} (${del}) tidak boleh lebih awal dari jam produksi (${prod}).`);
      }
    }
  };

  validateBatchTimes(input.b1Prod, input.b1Del, "Batch 1");
  validateBatchTimes(input.b2Prod, input.b2Del, "Batch 2");
  validateBatchTimes(input.b3Prod, input.b3Del, "Batch 3");

  // Nutrition Validation (must be non-negative numbers if provided)
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

  checkNutrition(input.eSmall, "Energi (Porsi Kecil)");
  checkNutrition(input.pSmall, "Protein (Porsi Kecil)");
  checkNutrition(input.fSmall, "Lemak (Porsi Kecil)");
  checkNutrition(input.cSmall, "Karbo (Porsi Kecil)");
  checkNutrition(input.fiSmall, "Serat (Porsi Kecil)");

  checkNutrition(input.eLarge, "Energi (Porsi Besar)");
  checkNutrition(input.pLarge, "Protein (Porsi Besar)");
  checkNutrition(input.fLarge, "Lemak (Porsi Besar)");
  checkNutrition(input.cLarge, "Karbo (Porsi Besar)");
  checkNutrition(input.fiLarge, "Serat (Porsi Besar)");

  return { valid: errors.length === 0, errors };
}
