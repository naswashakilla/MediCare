-- =====================================================================
-- SISTEM INFORMASI POLIKLINIK - DATA AWAL
-- Jalankan SETELAH 01_schema.sql berhasil.
-- Semua data di bawah hanya contoh (fiktif); boleh diganti.
-- =====================================================================

-- Data poli
insert into public.poli (nama_poli, keterangan) values
  ('Poli Umum', 'Pemeriksaan kesehatan umum'),
  ('Poli Gigi', 'Perawatan gigi dan mulut'),
  ('Poli Anak', 'Pemeriksaan kesehatan anak');

-- Data dokter (id_poli diambil otomatis dari nama poli)
insert into public.dokter (nama_dokter, spesialis, id_poli, hari_praktik, jam_mulai, jam_selesai)
select 'dr. Andi Wijaya', 'Dokter Umum', id_poli, 'Senin - Jumat', '08:00', '14:00'
  from public.poli where nama_poli = 'Poli Umum';

insert into public.dokter (nama_dokter, spesialis, id_poli, hari_praktik, jam_mulai, jam_selesai)
select 'drg. Rina Lestari', 'Dokter Gigi', id_poli, 'Senin - Rabu', '09:00', '15:00'
  from public.poli where nama_poli = 'Poli Gigi';

insert into public.dokter (nama_dokter, spesialis, id_poli, hari_praktik, jam_mulai, jam_selesai)
select 'dr. Maya Sari, Sp.A', 'Spesialis Anak', id_poli, 'Selasa - Kamis', '08:00', '12:00'
  from public.poli where nama_poli = 'Poli Anak';


-- =====================================================================
-- MEMBUAT AKUN ADMIN (lakukan manual, jangan lewat halaman register)
-- 1. Supabase Dashboard -> Authentication -> Users -> Add user
--    -> isi email dan password -> centang "Auto Confirm User" -> Create
-- 2. Ganti email di bawah dengan email tadi, lalu jalankan perintah ini:
-- =====================================================================
-- update public.profiles
--    set role = 'admin', nama_user = 'Admin Poliklinik'
--  where email = 'admin@contoh.com';
--
-- Karena kolom role dikunci untuk pengguna biasa, perintah ini hanya bisa
-- dijalankan dari SQL Editor (bukan dari aplikasi).
