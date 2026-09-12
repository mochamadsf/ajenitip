-- ============================================================
-- Migration: Tambah kolom rentang pengiriman batch + nilai gizi 4 kategori porsi
-- Untuk database yang sudah berjalan (idempotent — aman dijalankan ulang)
-- Menjalankan di: Supabase Dashboard → SQL Editor → paste & Run
-- ============================================================

--     a) Tambah kolom rentang pengiriman (format 24 jam)
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch1_delivery_start TIME;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch1_delivery_end TIME;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch2_delivery_start TIME;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch2_delivery_end TIME;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch3_delivery_start TIME;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch3_delivery_end TIME;

--     b) Tambah 20 kolom nilai gizi untuk 4 kategori porsi
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS energy_balita NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS protein_balita NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS fat_balita NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS carbs_balita NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS fiber_balita NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS energy_ibu NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS protein_ibu NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS fat_ibu NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS carbs_ibu NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS fiber_ibu NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS energy_tk NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS protein_tk NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS fat_tk NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS carbs_tk NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS fiber_tk NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS energy_sd NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS protein_sd NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS fat_sd NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS carbs_sd NUMERIC;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS fiber_sd NUMERIC;

--     c) Pindahkan data lama: jam pengiriman tunggal → rentang (mulai = selesai), lalu hapus kolom lama
DO $$
DECLARE
  has_old_delivery BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_menus' AND column_name = 'batch1_delivery_time'
  ) INTO has_old_delivery;

  IF has_old_delivery THEN
    UPDATE daily_menus SET
      batch1_delivery_start = COALESCE(batch1_delivery_start, batch1_delivery_time),
      batch1_delivery_end   = COALESCE(batch1_delivery_end,   batch1_delivery_time),
      batch2_delivery_start = COALESCE(batch2_delivery_start, batch2_delivery_time),
      batch2_delivery_end   = COALESCE(batch2_delivery_end,   batch2_delivery_time),
      batch3_delivery_start = COALESCE(batch3_delivery_start, batch3_delivery_time),
      batch3_delivery_end   = COALESCE(batch3_delivery_end,   batch3_delivery_time);

    ALTER TABLE daily_menus
      DROP COLUMN batch1_delivery_time,
      DROP COLUMN batch2_delivery_time,
      DROP COLUMN batch3_delivery_time;
  END IF;
END $$;

--     d) Pindahkan data gizi lama: small → balita, large → ibu, lalu hapus kolom lama
DO $$
DECLARE
  has_old_nutrition BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_menus' AND column_name = 'energy_small'
  ) INTO has_old_nutrition;

  IF has_old_nutrition THEN
    UPDATE daily_menus SET
      energy_balita  = COALESCE(energy_balita,  energy_small),
      protein_balita = COALESCE(protein_balita, protein_small),
      fat_balita     = COALESCE(fat_balita,     fat_small),
      carbs_balita   = COALESCE(carbs_balita,   carbs_small),
      fiber_balita   = COALESCE(fiber_balita,   fiber_small),
      energy_ibu     = COALESCE(energy_ibu,     energy_large),
      protein_ibu    = COALESCE(protein_ibu,    protein_large),
      fat_ibu        = COALESCE(fat_ibu,        fat_large),
      carbs_ibu      = COALESCE(carbs_ibu,      carbs_large),
      fiber_ibu      = COALESCE(fiber_ibu,      fiber_large);

    ALTER TABLE daily_menus
      DROP COLUMN energy_small,
      DROP COLUMN protein_small,
      DROP COLUMN fat_small,
      DROP COLUMN carbs_small,
      DROP COLUMN fiber_small,
      DROP COLUMN energy_large,
      DROP COLUMN protein_large,
      DROP COLUMN fat_large,
      DROP COLUMN carbs_large,
      DROP COLUMN fiber_large;
  END IF;
END $$;

-- e) Segarkan schema cache PostgREST agar kolom baru langsung dikenali
NOTIFY pgrst, 'reload schema';
