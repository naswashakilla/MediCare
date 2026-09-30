import NavTabs from "@/components/NavTabs";
import SiteHeader from "@/components/SiteHeader";
import { requireRole } from "@/lib/auth";

const menu = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/pendaftaran", label: "Pendaftaran" },
  { href: "/admin/pasien", label: "Pasien" },
  { href: "/admin/dokter", label: "Dokter" },
  { href: "/admin/poli", label: "Poli" },
  { href: "/admin/laporan", label: "Laporan" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("admin");
  return (
    <>
      <SiteHeader profile={profile} />
      <NavTabs items={menu} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
