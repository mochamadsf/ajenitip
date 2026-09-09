-- ============================================================
-- SPPG Storage Setup — Bucket & Policies untuk Foto Menu
--
-- CARA PAKAI:
--   1. Buka Supabase Dashboard → pilih project Anda
--   2. Menu kiri: SQL Editor → New query
--   3. Paste SELURUH isi file ini → klik Run
--
-- Script ini idempotent (aman dijalankan berulang kali).
-- ============================================================

-- 1. Pastikan bucket public 'menu-photos' sudah ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-photos', 'menu-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Pastikan bucket yang sudah ada berstatus PUBLIC,
-- supaya foto bisa ditampilkan di website tanpa login.
UPDATE storage.buckets
SET public = true
WHERE id = 'menu-photos'
  AND public = false;

-- 2. Policies Storage (RLS) untuk bucket 'menu-photos'
--    - INSERT / UPDATE / DELETE : hanya user yang sudah login (admin)
--
--    Catatan keamanan: TIDAK ada policy SELECT untuk publik. Bucket public
--    sudah menyajikan file lewat URL publik (/object/public/...) tanpa RLS,
--    jadi foto tetap tampil di website. Policy SELECT yang luas justru
--    memungkinkan siapa saja me-list semua file di bucket (peringatan
--    keamanan Supabase: "Clients can list all files in this bucket").
--    Statement DROP di bawah hanya membersihkan policy lama jika masih ada.

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

-- ============================================================
-- SELESAI. Verifikasi:
--   - Storage → bucket "menu-photos" muncul dengan ikon Public
--   - Policies → 3 policy (INSERT, UPDATE, DELETE) terdaftar pada
--     storage.objects; tidak ada policy SELECT publik
-- ============================================================