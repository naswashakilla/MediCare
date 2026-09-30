import { createClient } from "@/lib/supabase/server";

// Pilihan dropdown untuk form pendaftaran admin.
export async function ambilPilihan() {
  const supabase = await createClient();
  const [pasien, dokter] = await Promise.all([
    supabase.from("pasien").select("id_pasien, nama_pasien, nik").order("nama_pasien").limit(1000),
    supabase.from("dokter").select("id_dokter, nama_dokter, poli(nama_poli)").order("nama_dokter"),
  ]);
  type D = { id_dokter: number; nama_dokter: string; poli: { nama_poli: string } | null };
  return {
    pasien: pasien.data ?? [],
    dokter: ((dokter.data ?? []) as unknown as D[]).map((d) => ({
      id_dokter: d.id_dokter,
      nama_dokter: d.nama_dokter,
      poli: d.poli?.nama_poli ?? "-",
    })),
  };
}
