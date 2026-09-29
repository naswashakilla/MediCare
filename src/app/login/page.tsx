import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import SiteHeader from "@/components/SiteHeader";
import { dashboardFor, getProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  const profile = await getProfile();
  if (profile) redirect(dashboardFor(profile.role));

  return (
    <>
      <SiteHeader profile={null} />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Masuk</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">Masuk untuk mendaftar berobat atau mengelola data.</p>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-teal-700 hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
