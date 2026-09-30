"use client";

import { hapusData } from "@/app/admin/actions";

export default function DeleteButton({
  tabel,
  id,
  kembali,
  pesan,
}: {
  tabel: "poli" | "dokter" | "pasien" | "pendaftaran";
  id: number;
  kembali: string;
  pesan: string;
}) {
  return (
    <form
      action={hapusData}
      onSubmit={(e) => {
        if (!confirm(pesan)) e.preventDefault();
      }}
    >
      <input type="hidden" name="tabel" value={tabel} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kembali" value={kembali} />
      <button type="submit" className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
        Hapus
      </button>
    </form>
  );
}
