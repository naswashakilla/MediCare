import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard Pasien" };

export default async function PasienDashboardPage() {
  const profile = await requireRole("pasien");

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Halo, {profile.nama_user}</h1>
      <p className="mt-1 text-sm text-slate-500">Selamat datang di dashboard pasien.</p>

      <div className="mt-6 max-w-md rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-800">Akun kamu</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Nama</dt>
            <dd className="font-medium text-slate-800">{profile.nama_user}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{profile.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Peran</dt>
            <dd className="font-medium text-slate-800">Pasien</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
