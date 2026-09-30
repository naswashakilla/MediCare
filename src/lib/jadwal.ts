const NAMA_HARI = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

export const jam = (t: string | null) => (t ? t.slice(0, 5) : "");

// Tanggal hari ini (YYYY-MM-DD) menurut zona waktu Jakarta.
export const hariIniJakarta = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

// "2026-10-05" -> "5 Oktober 2026"
export function tanggal(iso: string | null) {
  if (!iso) return "-";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// timestamptz dari database -> "5 Okt 2026, 09.30"
export function waktu(ts: string) {
  return new Date(ts).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

const indeksHari = (nama: string) => NAMA_HARI.indexOf(nama.trim().toLowerCase().replace(/['’]/g, ""));

// Cek apakah dokter praktik pada tanggal tertentu, dari teks seperti
// "Senin - Jumat" atau "Senin, Rabu, Jumat". Kalau teks tidak bisa dibaca,
// dianggap praktik (tidak menghalangi pendaftaran).
export function dokterPraktik(hariPraktik: string | null, isoDate: string) {
  if (!hariPraktik) return true;
  const target = new Date(`${isoDate}T00:00:00Z`).getUTCDay();

  for (const bagian of hariPraktik.split(",")) {
    const ujung = bagian.split(/\s*(?:-|–|s\/d|sd)\s*/i);
    if (ujung.length === 2) {
      const a = indeksHari(ujung[0]);
      const b = indeksHari(ujung[1]);
      if (a < 0 || b < 0) return true;
      for (let i = a; ; i = (i + 1) % 7) {
        if (i === target) return true;
        if (i === b) break;
      }
    } else {
      const i = indeksHari(bagian);
      if (i < 0) return true;
      if (i === target) return true;
    }
  }
  return false;
}
