import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { SITE_NAME } from "@/lib/constants";
import { dashboardFor, type Profile } from "@/lib/auth";

const linkKecil = "rounded-lg px-3 py-1.5 font-medium hover:bg-slate-100";

export default function SiteHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-teal-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600 text-white">+</span>
          {SITE_NAME}
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {profile ? (
            <>
              <Link href={dashboardFor(profile.role)} className={linkKecil}>
                Dashboard
              </Link>
              <span className="hidden items-center gap-2 px-2 text-slate-500 sm:flex">
                {profile.nama_user}
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                  {profile.role === "admin" ? "Admin" : "Pasien"}
                </span>
              </span>
              <form action={logout}>
                <button type="submit" className="rounded-lg bg-slate-800 px-3 py-1.5 font-medium text-white hover:bg-slate-700">
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={linkKecil}>
                Masuk
              </Link>
              <Link href="/register" className="rounded-lg bg-teal-600 px-3 py-1.5 font-medium text-white hover:bg-teal-700">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
