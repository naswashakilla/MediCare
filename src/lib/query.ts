export const PAGE_SIZE = 10;

export function halaman(v?: string) {
  const n = parseInt(v ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function rentang(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE - 1 };
}

// Buang karakter yang punya arti khusus di filter PostgREST / LIKE.
export function bersihkanCari(q?: string) {
  return (q ?? "").replace(/[%_,()\\*]/g, " ").replace(/\s+/g, " ").trim().slice(0, 50);
}

export function buatUrl(base: string, params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && !(k === "page" && Number(v) <= 1)) sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export type ListParams = { q?: string; page?: string; status?: string; ok?: string; error?: string };
