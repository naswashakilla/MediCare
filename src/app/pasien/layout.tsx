import NavTabs from "@/components/NavTabs";
import SiteHeader from "@/components/SiteHeader";
import { requireRole } from "@/lib/auth";

const menu = [
  { href: "/pasien/dashboard", label: "Dashboard" },
  { href: "/pasien/daftar", label: "Daftar Berobat" },
  { href: "/pasien/riwayat", label: "Riwayat" },
  { href: "/pasien/profil", label: "Data Diri" },
];

export default async function PasienLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("pasien");
  return (
    <>
      <SiteHeader profile={profile} />
      <NavTabs items={menu} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
