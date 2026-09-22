-- ============================================================
-- Migration: Nama sekolah & jumlah porsi penerima per batch
-- Untuk database yang sudah berjalan (idempotent — aman dijalankan ulang)
-- Menjalankan di: Supabase Dashboard → SQL Editor → paste & Run
-- ============================================================

-- a) Nama sekolah penerima tiap batch (diisi admin di panel admin → Kelola Menu)
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch1_school_name TEXT;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch2_school_name TEXT;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch3_school_name TEXT;

-- b) Jumlah porsi penerima tiap batch (0 = belum diisi)
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch1_beneficiary_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch2_beneficiary_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch3_beneficiary_count INTEGER NOT NULL DEFAULT 0;

-- c) Backfill ringan: baris lama yang belum punya rincian batch & totalnya kosong
--    diisi dari jumlah ketiga batch (tidak mengubah data yang sudah ada isinya).
UPDATE daily_menus
SET beneficiary_count = batch1_beneficiary_count
                      + batch2_beneficiary_count
                      + batch3_beneficiary_count
WHERE beneficiary_count = 0
  AND (batch1_beneficiary_count + batch2_beneficiary_count + batch3_beneficiary_count) > 0;

-- d) Segarkan schema cache PostgREST agar kolom baru langsung dikenali
NOTIFY pgrst, 'reload schema';
