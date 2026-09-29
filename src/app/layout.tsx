import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Sistem informasi poliklinik: lihat jadwal dokter dan daftar berobat secara online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
