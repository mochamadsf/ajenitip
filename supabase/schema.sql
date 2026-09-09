-- ============================================================
-- SPPG Kitchen Menu & Food Safety — Supabase Complete Schema
-- Copy and run this script in the Supabase SQL Editor.
-- ============================================================

-- 1. Create Kitchen Configuration Table
CREATE TABLE IF NOT EXISTS kitchen_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_name TEXT NOT NULL DEFAULT 'Dapur SPPG',
  instagram_url TEXT,
  tiktok_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert Default Kitchen Config Entry
INSERT INTO kitchen_config (kitchen_name) 
VALUES ('Dapur SPPG Aje')
ON CONFLICT DO NOTHING;

-- 2. Create Daily Menus Table
CREATE TABLE IF NOT EXISTS daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_date DATE NOT NULL UNIQUE,
  menu_name TEXT NOT NULL,
  menu_components TEXT[] NOT NULL DEFAULT '{}',
  photo_url TEXT,
  
  -- Batch 1 Timings & Status (pengiriman = rentang waktu, format 24 jam)
  batch1_production_time TIME,
  batch1_delivery_start TIME,
  batch1_delivery_end TIME,
  batch1_delivered BOOLEAN NOT NULL DEFAULT false,
  
  -- Batch 2 Timings & Status (pengiriman = rentang waktu, format 24 jam)
  batch2_production_time TIME,
  batch2_delivery_start TIME,
  batch2_delivery_end TIME,
  batch2_delivered BOOLEAN NOT NULL DEFAULT false,
  
  -- Batch 3 Timings & Status (pengiriman = rentang waktu, format 24 jam)
  batch3_production_time TIME,
  batch3_delivery_start TIME,
  batch3_delivery_end TIME,
  batch3_delivered BOOLEAN NOT NULL DEFAULT false,

  -- Food Safety & Beneficiary Info
  safe_hours NUMERIC NOT NULL DEFAULT 4,
  beneficiary_count INTEGER NOT NULL DEFAULT 0,
  nutritionist_name TEXT,

  -- Nutrition Info (1) Porsi Kecil — Balita
  energy_balita NUMERIC,
  protein_balita NUMERIC,
  fat_balita NUMERIC,
  carbs_balita NUMERIC,
  fiber_balita NUMERIC,

  -- Nutrition Info (2) Porsi Besar — Ibu Hamil & Ibu Menyusui
  energy_ibu NUMERIC,
  protein_ibu NUMERIC,
  fat_ibu NUMERIC,
  carbs_ibu NUMERIC,
  fiber_ibu NUMERIC,

  -- Nutrition Info (3) Porsi Kecil — TK/PAUD/KB/RA/SD 1-3
  energy_tk NUMERIC,
  protein_tk NUMERIC,
  fat_tk NUMERIC,
  carbs_tk NUMERIC,
  fiber_tk NUMERIC,

  -- Nutrition Info (4) Porsi Besar — SD 4-6/SMP/SMA
  energy_sd NUMERIC,
  protein_sd NUMERIC,
  fat_sd NUMERIC,
  carbs_sd NUMERIC,
  fiber_sd NUMERIC,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for Fast Date Searches
CREATE INDEX IF NOT EXISTS idx_daily_menus_date ON daily_menus(menu_date DESC);

-- 2b. Migration untuk database yang sudah berjalan (idempotent — aman dijalankan ulang)
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

-- 3. Row Level Security (RLS) Setup

-- kitchen_config RLS
ALTER TABLE kitchen_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read kitchen config" ON kitchen_config;
CREATE POLICY "Public can read kitchen config"
  ON kitchen_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can update kitchen config" ON kitchen_config;
CREATE POLICY "Authenticated users can update kitchen config"
  ON kitchen_config FOR UPDATE
  USING (auth.role() = 'authenticated');

-- daily_menus RLS
ALTER TABLE daily_menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read daily menus" ON daily_menus;
CREATE POLICY "Public can read daily menus"
  ON daily_menus FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert daily menus" ON daily_menus;
CREATE POLICY "Authenticated users can insert daily menus"
  ON daily_menus FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update daily menus" ON daily_menus;
CREATE POLICY "Authenticated users can update daily menus"
  ON daily_menus FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete daily menus" ON daily_menus;
CREATE POLICY "Authenticated users can delete daily menus"
  ON daily_menus FOR DELETE
  USING (auth.role() = 'authenticated');

-- 4. Storage Bucket & Policies for Menu Photos
--    (Shortcut: file supabase/storage-setup.sql berisi bagian ini saja)
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-photos', 'menu-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Pastikan bucket existing berstatus public
UPDATE storage.buckets
SET public = true
WHERE id = 'menu-photos'
  AND public = false;

-- Keamanan: TIDAK membuat policy SELECT publik. Bucket public menyajikan
-- file via URL publik tanpa RLS; policy SELECT luas hanya membuka celah
-- list semua file (security warning Supabase). DROP di bawah membersihkan
-- policy lama jika masih ada.
DROP POLICY IF EXISTS "Public can view menu photos" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload menu photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload menu photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'menu-photos' AND (SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update menu photos" ON storage.objects;
CREATE POLICY "Authenticated users can update menu photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'menu-photos' AND (SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete menu photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete menu photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'menu-photos' AND (SELECT auth.uid()) IS NOT NULL);

-- 5. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_daily_menus_updated_at ON daily_menus;
CREATE TRIGGER update_daily_menus_updated_at
  BEFORE UPDATE ON daily_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kitchen_config_updated_at ON kitchen_config;
CREATE TRIGGER update_kitchen_config_updated_at
  BEFORE UPDATE ON kitchen_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Sample Data Insertion (Optional Demo Row)
-- ============================================================
INSERT INTO daily_menus (
  menu_date,
  menu_name,
  menu_components,
  batch1_production_time,
  batch1_delivery_start,
  batch1_delivery_end,
  batch1_delivered,
  batch2_production_time,
  batch2_delivery_start,
  batch2_delivery_end,
  batch2_delivered,
  batch3_production_time,
  batch3_delivery_start,
  batch3_delivery_end,
  batch3_delivered,
  safe_hours,
  beneficiary_count,
  nutritionist_name,
  energy_balita,
  protein_balita,
  fat_balita,
  carbs_balita,
  fiber_balita,
  energy_ibu,
  protein_ibu,
  fat_ibu,
  carbs_ibu,
  fiber_ibu,
  energy_tk,
  protein_tk,
  fat_tk,
  carbs_tk,
  fiber_tk,
  energy_sd,
  protein_sd,
  fat_sd,
  carbs_sd,
  fiber_sd
) VALUES (
  CURRENT_DATE,
  'Nasi Ayam Geprek dengan Sambal Matah',
  ARRAY['Nasi Putih', 'Ayam Geprek Sambal Matah', 'Sayur Bayam Bening', 'Tempe Goreng', 'Kerupuk', 'Buah Jeruk'],
  '05:00:00',
  '07:00:00',
  '08:00:00',
  true,
  '10:30:00',
  '11:00:00',
  '12:00:00',
  false,
  '15:00:00',
  '15:30:00',
  '16:30:00',
  false,
  4,
  350,
  'Ns. Siti Aminah, S.Gz',
  450, 18, 15, 60, 5,
  700, 30, 25, 90, 8,
  350, 15, 12, 45, 4,
  650, 28, 22, 85, 7
) ON CONFLICT (menu_date) DO UPDATE SET
  menu_name = EXCLUDED.menu_name,
  menu_components = EXCLUDED.menu_components,
  batch1_production_time = EXCLUDED.batch1_production_time,
  batch1_delivery_start = EXCLUDED.batch1_delivery_start,
  batch1_delivery_end = EXCLUDED.batch1_delivery_end,
  batch1_delivered = EXCLUDED.batch1_delivered,
  batch2_production_time = EXCLUDED.batch2_production_time,
  batch2_delivery_start = EXCLUDED.batch2_delivery_start,
  batch2_delivery_end = EXCLUDED.batch2_delivery_end,
  batch2_delivered = EXCLUDED.batch2_delivered,
  batch3_production_time = EXCLUDED.batch3_production_time,
  batch3_delivery_start = EXCLUDED.batch3_delivery_start,
  batch3_delivery_end = EXCLUDED.batch3_delivery_end,
  batch3_delivered = EXCLUDED.batch3_delivered,
  safe_hours = EXCLUDED.safe_hours,
  beneficiary_count = EXCLUDED.beneficiary_count,
  nutritionist_name = EXCLUDED.nutritionist_name,
  energy_balita = EXCLUDED.energy_balita,
  protein_balita = EXCLUDED.protein_balita,
  fat_balita = EXCLUDED.fat_balita,
  carbs_balita = EXCLUDED.carbs_balita,
  fiber_balita = EXCLUDED.fiber_balita,
  energy_ibu = EXCLUDED.energy_ibu,
  protein_ibu = EXCLUDED.protein_ibu,
  fat_ibu = EXCLUDED.fat_ibu,
  carbs_ibu = EXCLUDED.carbs_ibu,
  fiber_ibu = EXCLUDED.fiber_ibu,
  energy_tk = EXCLUDED.energy_tk,
  protein_tk = EXCLUDED.protein_tk,
  fat_tk = EXCLUDED.fat_tk,
  carbs_tk = EXCLUDED.carbs_tk,
  fiber_tk = EXCLUDED.fiber_tk,
  energy_sd = EXCLUDED.energy_sd,
  protein_sd = EXCLUDED.protein_sd,
  fat_sd = EXCLUDED.fat_sd,
  carbs_sd = EXCLUDED.carbs_sd,
  fiber_sd = EXCLUDED.fiber_sd;
