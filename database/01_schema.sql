-- =====================================================================
-- SISTEM INFORMASI POLIKLINIK - SKEMA DATABASE (Supabase / PostgreSQL)
-- Cara pakai: Supabase Dashboard -> SQL Editor -> New query
--             -> tempel seluruh isi file ini -> Run
-- Jalankan file ini SEBELUM 02_seed.sql
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TABEL
-- ---------------------------------------------------------------------

-- Tabel Profiles: 1 baris per akun (terhubung ke Supabase Auth).
-- Password TIDAK disimpan di sini; dikelola dan di-hash oleh Supabase Auth.
create table public.profiles (
  id_user    uuid primary key references auth.users (id) on delete cascade,
  nama_user  varchar(50)  not null,
  email      varchar(100),
  role       varchar(10)  not null default 'pasien'
             check (role in ('admin', 'pasien')),
  created_at timestamptz  not null default now()
);

-- Tabel Poli
create table public.poli (
  id_poli    integer generated always as identity primary key,
  nama_poli  varchar(30)  not null unique,
  keterangan varchar(100)
);

-- Tabel Dokter
create table public.dokter (
  id_dokter    integer generated always as identity primary key,
  nama_dokter  varchar(50) not null,
  spesialis    varchar(30),
  id_poli      integer     not null references public.poli (id_poli) on delete restrict,
  hari_praktik varchar(30),
  jam_mulai    time,
  jam_selesai  time,
  check (jam_selesai is null or jam_mulai is null or jam_selesai > jam_mulai)
);

-- Tabel Pasien
-- id_user boleh kosong (pasien yang didata admin tanpa akun)
create table public.pasien (
  id_pasien   integer generated always as identity primary key,
  id_user     uuid unique references public.profiles (id_user) on delete set null,
  nama_pasien varchar(50) not null,
  nik         varchar(16) unique check (nik ~ '^[0-9]{16}$'),
  tempatlahir varchar(30),
  tgllahir    date,
  jk          varchar(10) check (jk in ('Laki-laki', 'Perempuan')),
  alamat      varchar(100),
  no_hp       varchar(15)
);

-- Tabel Pendaftaran (transaksi pendaftaran berobat)
create table public.pendaftaran (
  id_daftar     integer generated always as identity primary key,
  id_pasien     integer     not null references public.pasien (id_pasien) on delete cascade,
  id_dokter     integer     not null references public.dokter (id_dokter) on delete restrict,
  tgl_daftar    timestamptz not null default now(),
  tgl_kunjungan date        not null,
  keluhan       varchar(200),
  status        varchar(15) not null default 'menunggu'
                check (status in ('menunggu', 'dikonfirmasi', 'selesai', 'dibatalkan'))
);


-- ---------------------------------------------------------------------
-- 2. INDEX (mempercepat join, pencarian, dan laporan)
-- ---------------------------------------------------------------------
create index idx_dokter_id_poli          on public.dokter (id_poli);
create index idx_pasien_nama             on public.pasien (nama_pasien);
create index idx_pendaftaran_id_pasien   on public.pendaftaran (id_pasien);
create index idx_pendaftaran_id_dokter   on public.pendaftaran (id_dokter);
create index idx_pendaftaran_tgl         on public.pendaftaran (tgl_kunjungan);


-- ---------------------------------------------------------------------
-- 3. TRIGGER: otomatis buat profile saat ada akun baru mendaftar
--    Role selalu 'pasien'. Nama diambil dari metadata saat sign up
--    (options.data.nama), kalau kosong dipakai bagian depan email.
-- ---------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id_user, nama_user, email, role)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'nama', ''),
                  split_part(new.email, '@', 1)), 50),
    new.email,
    'pasien'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 4. FUNGSI BANTU
-- ---------------------------------------------------------------------

-- Cek apakah user yang sedang login adalah admin
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id_user = (select auth.uid()) and role = 'admin'
  );
$$;

-- Pasien membatalkan pendaftarannya sendiri (hanya jika masih 'menunggu').
-- Dibuat sebagai fungsi agar pasien tidak bisa mengubah kolom lain.
create function public.batalkan_pendaftaran(p_id integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.pendaftaran
     set status = 'dibatalkan'
   where id_daftar = p_id
     and status = 'menunggu'
     and id_pasien in (select id_pasien from public.pasien
                       where id_user = (select auth.uid()));
  if not found then
    raise exception 'Pendaftaran tidak ditemukan atau tidak bisa dibatalkan';
  end if;
end;
$$;

-- Hak eksekusi fungsi: hanya user yang sudah login
revoke execute on function public.is_admin()                    from public, anon;
revoke execute on function public.batalkan_pendaftaran(integer) from public, anon;
revoke execute on function public.handle_new_user()             from public, anon, authenticated;
grant  execute on function public.is_admin()                    to authenticated;
grant  execute on function public.batalkan_pendaftaran(integer) to authenticated;


-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (keamanan per peran)
-- ---------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.poli        enable row level security;
alter table public.dokter      enable row level security;
alter table public.pasien      enable row level security;
alter table public.pendaftaran enable row level security;

-- ===== profiles =====
-- Lihat: profil sendiri, admin melihat semua
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id_user = (select auth.uid()) or public.is_admin());

-- Ubah: profil sendiri saja, dan HANYA kolom nama_user (lihat GRANT di bawah)
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id_user = (select auth.uid()))
  with check (id_user = (select auth.uid()));

-- Cegah pengguna mengubah role sendiri jadi admin
revoke update on public.profiles from authenticated;
grant  update (nama_user) on public.profiles to authenticated;

-- ===== poli & dokter =====
-- Lihat: semua orang (dipakai di landing page)
create policy "poli_select_all" on public.poli
  for select to anon, authenticated using (true);
create policy "dokter_select_all" on public.dokter
  for select to anon, authenticated using (true);

-- Tambah/ubah/hapus: admin saja
create policy "poli_admin_insert" on public.poli
  for insert to authenticated with check (public.is_admin());
create policy "poli_admin_update" on public.poli
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "poli_admin_delete" on public.poli
  for delete to authenticated using (public.is_admin());

create policy "dokter_admin_insert" on public.dokter
  for insert to authenticated with check (public.is_admin());
create policy "dokter_admin_update" on public.dokter
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "dokter_admin_delete" on public.dokter
  for delete to authenticated using (public.is_admin());

-- ===== pasien =====
-- Lihat/tambah/ubah: data sendiri atau admin. Hapus: admin saja.
create policy "pasien_select" on public.pasien
  for select to authenticated
  using (id_user = (select auth.uid()) or public.is_admin());

create policy "pasien_insert" on public.pasien
  for insert to authenticated
  with check (id_user = (select auth.uid()) or public.is_admin());

create policy "pasien_update" on public.pasien
  for update to authenticated
  using (id_user = (select auth.uid()) or public.is_admin())
  with check (id_user = (select auth.uid()) or public.is_admin());

create policy "pasien_delete" on public.pasien
  for delete to authenticated using (public.is_admin());

-- ===== pendaftaran =====
-- Lihat: pendaftaran milik sendiri atau admin
create policy "pendaftaran_select" on public.pendaftaran
  for select to authenticated
  using (
    public.is_admin()
    or id_pasien in (select id_pasien from public.pasien
                     where id_user = (select auth.uid()))
  );

-- Tambah: pasien hanya untuk dirinya sendiri dan status harus 'menunggu'
create policy "pendaftaran_insert" on public.pendaftaran
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      status = 'menunggu'
      and id_pasien in (select id_pasien from public.pasien
                        where id_user = (select auth.uid()))
    )
  );

-- Ubah dan hapus: admin saja (pasien membatalkan lewat fungsi batalkan_pendaftaran)
create policy "pendaftaran_admin_update" on public.pendaftaran
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "pendaftaran_admin_delete" on public.pendaftaran
  for delete to authenticated using (public.is_admin());
