// Helper kecil untuk Server Action dan URL. (Bukan file "use server".)

export function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

export function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

// Ubah string kosong menjadi null sebelum disimpan ke database.
export const orNull = (v: string) => (v.trim() === "" ? null : v.trim());

// Pastikan URL "kembali" dari form hanya mengarah ke halaman dalam situs ini.
export function urlAman(url: string, prefix: string, fallback: string) {
  return url.startsWith(prefix) && !url.startsWith("//") ? url : fallback;
}

// Tambahkan pesan ?ok= atau ?error= ke sebuah URL.
export function denganPesan(url: string, key: "ok" | "error", pesan: string) {
  const u = new URL(url, "http://local");
  u.searchParams.delete("ok");
  u.searchParams.delete("error");
  u.searchParams.set(key, pesan);
  return u.pathname + u.search;
}
