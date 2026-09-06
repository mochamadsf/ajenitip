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
  
  -- Batch 1 Timings & Status
  batch1_production_time TIME,
  batch1_delivery_time TIME,
  batch1_delivered BOOLEAN NOT NULL DEFAULT false,
  
  -- Batch 2 Timings & Status
  batch2_production_time TIME,
  batch2_delivery_time TIME,
  batch2_delivered BOOLEAN NOT NULL DEFAULT false,
  
  -- Batch 3 Timings & Status
  batch3_production_time TIME,
  batch3_delivery_time TIME,
  batch3_delivered BOOLEAN NOT NULL DEFAULT false,

  -- Food Safety & Beneficiary Info
  safe_hours NUMERIC NOT NULL DEFAULT 4,
  beneficiary_count INTEGER NOT NULL DEFAULT 0,
  nutritionist_name TEXT,

  -- Nutrition Info (Porsi Kecil)
  energy_small NUMERIC,
  protein_small NUMERIC,
  fat_small NUMERIC,
  carbs_small NUMERIC,
  fiber_small NUMERIC,

  -- Nutrition Info (Porsi Besar)
  energy_large NUMERIC,
  protein_large NUMERIC,
  fat_large NUMERIC,
  carbs_large NUMERIC,
  fiber_large NUMERIC,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for Fast Date Searches
CREATE INDEX IF NOT EXISTS idx_daily_menus_date ON daily_menus(menu_date DESC);

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
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-photos', 'menu-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view menu photos" ON storage.objects;
CREATE POLICY "Public can view menu photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-photos');

DROP POLICY IF EXISTS "Authenticated users can upload menu photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload menu photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'menu-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update menu photos" ON storage.objects;
CREATE POLICY "Authenticated users can update menu photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'bucket_id = menu-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete menu photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete menu photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'menu-photos' AND auth.role() = 'authenticated');

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
  batch1_delivery_time,
  batch1_delivered,
  batch2_production_time,
  batch2_delivery_time,
  batch2_delivered,
  batch3_production_time,
  batch3_delivery_time,
  batch3_delivered,
  safe_hours,
  beneficiary_count,
  nutritionist_name,
  energy_small,
  protein_small,
  fat_small,
  carbs_small,
  fiber_small,
  energy_large,
  protein_large,
  fat_large,
  carbs_large,
  fiber_large
) VALUES (
  CURRENT_DATE,
  'Nasi Ayam Geprek dengan Sambal Matah',
  ARRAY['Nasi Putih', 'Ayam Geprek Sambal Matah', 'Sayur Bayam Bening', 'Tempe Goreng', 'Kerupuk', 'Buah Jeruk'],
  '05:00:00',
  '07:30:00',
  true,
  '10:30:00',
  '11:00:00',
  false,
  '15:00:00',
  '15:30:00',
  false,
  4,
  350,
  'Ns. Siti Aminah, S.Gz',
  450, 18, 15, 60, 5,
  650, 28, 22, 85, 7
) ON CONFLICT (menu_date) DO UPDATE SET
  menu_name = EXCLUDED.menu_name,
  menu_components = EXCLUDED.menu_components,
  batch1_production_time = EXCLUDED.batch1_production_time,
  batch1_delivery_time = EXCLUDED.batch1_delivery_time,
  batch1_delivered = EXCLUDED.batch1_delivered,
  batch2_production_time = EXCLUDED.batch2_production_time,
  batch2_delivery_time = EXCLUDED.batch2_delivery_time,
  batch2_delivered = EXCLUDED.batch2_delivered,
  batch3_production_time = EXCLUDED.batch3_production_time,
  batch3_delivery_time = EXCLUDED.batch3_delivery_time,
  batch3_delivered = EXCLUDED.batch3_delivered,
  safe_hours = EXCLUDED.safe_hours,
  beneficiary_count = EXCLUDED.beneficiary_count,
  nutritionist_name = EXCLUDED.nutritionist_name,
  energy_small = EXCLUDED.energy_small,
  protein_small = EXCLUDED.protein_small,
  fat_small = EXCLUDED.fat_small,
  carbs_small = EXCLUDED.carbs_small,
  fiber_small = EXCLUDED.fiber_small,
  energy_large = EXCLUDED.energy_large,
  protein_large = EXCLUDED.protein_large,
  fat_large = EXCLUDED.fat_large,
  carbs_large = EXCLUDED.carbs_large,
  fiber_large = EXCLUDED.fiber_large;
