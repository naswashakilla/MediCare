import type { Metadata } from "next";
import { simpanProfil } from "@/app/pasien/actions";
import PasienForm from "@/components/PasienForm";
import { getPasien, requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Data Diri" };

export default async function ProfilPage({ searchParams }: { searchParams: Promise<{ perlu?: string }> }) {
  const profile = await requireRole("pasien");
  const { perlu } = await searchParams;
  const pasien = await getPasien(profile.id_user);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900">Data Diri</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        {perlu ? "Lengkapi data diri dulu sebelum mendaftar berobat." : "Data ini dipakai saat kamu mendaftar berobat."}
      </p>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {/* Nama awal diambil dari akun jika data diri belum pernah diisi */}
        <PasienForm
          action={simpanProfil}
          batalHref="/pasien/dashboard"
          awal={pasien ?? { id_pasien: 0, nama_pasien: profile.nama_user, nik: null, tempatlahir: null, tgllahir: null, jk: null, alamat: null, no_hp: null }}
        />
      </div>
    </div>
  );
}
