import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";
import SiteHeader from "@/components/SiteHeader";
import { dashboardFor, getProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Daftar Akun" };

export default async function RegisterPage() {
  const profile = await getProfile();
  if (profile) redirect(dashboardFor(profile.role));

  return (
    <>
      <SiteHeader profile={null} />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Buat Akun Pasien</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">Isi data berikut untuk mulai mendaftar berobat online.</p>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-teal-700 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
