import { getProfile } from "@/lib/auth";
import { ambilLaporan, bacaFilter, BATAS_BARIS, namaPoli } from "@/lib/laporan";
import { buatPdf } from "@/lib/laporan-pdf";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const profile = await getProfile();
  if (profile?.role !== "admin") return new Response("Forbidden", { status: 403 });

  const f = bacaFilter(Object.fromEntries(new URL(request.url).searchParams));
  const supabase = await createClient();
  const { rows, total, error } = await ambilLaporan(supabase, f);
  if (error) return new Response("Gagal mengambil data", { status: 500 });

  const pdf = buatPdf(rows, f, await namaPoli(supabase, f.poli), total > BATAS_BARIS);
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="laporan-pendaftaran_${f.dari}_${f.sampai}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
