import { getProfile } from "@/lib/auth";
import { ambilLaporan, bacaFilter, namaPoli } from "@/lib/laporan";
import { buatExcel } from "@/lib/laporan-excel";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const profile = await getProfile();
  if (profile?.role !== "admin") return new Response("Forbidden", { status: 403 });

  const f = bacaFilter(Object.fromEntries(new URL(request.url).searchParams));
  const supabase = await createClient();
  const { rows, error } = await ambilLaporan(supabase, f);
  if (error) return new Response("Gagal mengambil data", { status: 500 });

  const xlsx = await buatExcel(rows, f, await namaPoli(supabase, f.poli));
  return new Response(new Uint8Array(xlsx), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-pendaftaran_${f.dari}_${f.sampai}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
