import type { Metadata } from "next";
import PendaftaranAdminForm from "@/components/PendaftaranAdminForm";
import { ambilPilihan } from "../data";

export const metadata: Metadata = { title: "Tambah Pendaftaran" };

export default async function PendaftaranBaruPage() {
  const { pasien, dokter } = await ambilPilihan();
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Tambah Pendaftaran</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <PendaftaranAdminForm pasien={pasien} dokter={dokter} />
      </div>
    </div>
  );
}
