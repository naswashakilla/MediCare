import SiteHeader from "@/components/SiteHeader";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("admin");
  return (
    <>
      <SiteHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
