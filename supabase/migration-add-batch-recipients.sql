-- ============================================================
-- Migration: Satu batch bisa punya beberapa penerima (sekolah)
-- Dari: batch{n}_school_name + batch{n}_beneficiary_count (1 sekolah per batch)
-- Ke  : batch{n}_recipients JSONB = [{"school": "SDN Sukaasih 2", "count": 150}, ...]
-- Untuk database yang sudah berjalan (idempotent — aman dijalankan ulang)
-- Menjalankan di: Supabase Dashboard → SQL Editor → paste & Run
-- ============================================================

-- a) Daftar penerima (sekolah) tiap batch — default array kosong
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch1_recipients JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch2_recipients JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS batch3_recipients JSONB NOT NULL DEFAULT '[]'::jsonb;

-- b) Backfill data lama: satu sekolah per batch dipindahkan ke bentuk daftar.
--    Hanya dijalankan bila kolom recipients masih kosong, sehingga data yang
--    sudah memakai format baru tidak pernah tertimpa.
UPDATE daily_menus
SET batch1_recipients = jsonb_build_array(
      jsonb_build_object(
        'school', TRIM(batch1_school_name),
        'count', COALESCE(batch1_beneficiary_count, 0)
      )
    )
WHERE (batch1_recipients IS NULL OR batch1_recipients = '[]'::jsonb)
  AND COALESCE(TRIM(batch1_school_name), '') <> '';

UPDATE daily_menus
SET batch2_recipients = jsonb_build_array(
      jsonb_build_object(
        'school', TRIM(batch2_school_name),
        'count', COALESCE(batch2_beneficiary_count, 0)
      )
    )
WHERE (batch2_recipients IS NULL OR batch2_recipients = '[]'::jsonb)
  AND COALESCE(TRIM(batch2_school_name), '') <> '';

UPDATE daily_menus
SET batch3_recipients = jsonb_build_array(
      jsonb_build_object(
        'school', TRIM(batch3_school_name),
        'count', COALESCE(batch3_beneficiary_count, 0)
      )
    )
WHERE (batch3_recipients IS NULL OR batch3_recipients = '[]'::jsonb)
  AND COALESCE(TRIM(batch3_school_name), '') <> '';

-- c) Kolom lama (batch{n}_school_name & batch{n}_beneficiary_count) tetap
--    dipertahankan sebagai ringkasan agar pembaca data lama tetap benar:
--    - batch{n}_school_name     = nama sekolah digabung dengan ", "
--    - batch{n}_beneficiary_count = total porsi seluruh penerima batch tersebut
--    Panel admin mengisi keduanya otomatis setiap kali menu disimpan.

-- d) Segarkan schema cache PostgREST agar kolom baru langsung dikenali
NOTIFY pgrst, 'reload schema';
