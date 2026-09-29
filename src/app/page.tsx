import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { dashboardFor, getProfile } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

type Dokter = {
  id_dokter: number;
  nama_dokter: string;
  spesialis: string | null;
  hari_praktik: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
};

type PoliDenganDokter = {
  id_poli: number;
  nama_poli: string;
  keterangan: string | null;
  dokter: Dokter[];
};

const jam = (t: string | null) => (t ? t.slice(0, 5) : "");

export default async function Home() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("poli")
    .select(
      "id_poli, nama_poli, keterangan, dokter(id_dokter, nama_dokter, spesialis, hari_praktik, jam_mulai, jam_selesai)"
    )
    .order("id_poli");
  const daftarPoli = (data ?? []) as PoliDenganDokter[];

  return (
    <>
      <SiteHeader profile={profile} />

      <section className="bg-teal-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <h1 className="max-w-2xl text-3xl font-bold sm:text-4xl">
            Daftar berobat di {SITE_NAME} tanpa antre panjang
          </h1>
          <p className="mt-3 max-w-xl text-teal-50">
            Lihat jadwal dokter, pilih poli, dan daftar kunjungan langsung dari website.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {profile ? (
              <Link href={dashboardFor(profile.role)} className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                Ke Dashboard
              </Link>
            ) : (
              <>
                <Link href="/register" className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                  Daftar Sekarang
                </Link>
                <Link href="/login" className="rounded-lg border border-white/60 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
                  Masuk
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h2 className="text-xl font-bold text-slate-900">Poli dan Jadwal Dokter</h2>

        {daftarPoli.length === 0 ? (
          <p className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-500 ring-1 ring-slate-200">
            Data poli belum tersedia.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {daftarPoli.map((poli) => (
              <article key={poli.id_poli} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-lg font-semibold text-teal-700">{poli.nama_poli}</h3>
                {poli.keterangan && <p className="mt-1 text-sm text-slate-500">{poli.keterangan}</p>}

                <ul className="mt-4 space-y-3">
                  {poli.dokter.length === 0 && (
                    <li className="text-sm text-slate-400">Belum ada dokter.</li>
                  )}
                  {poli.dokter.map((d) => (
                    <li key={d.id_dokter} className="border-t border-slate-100 pt-3 text-sm">
                      <p className="font-medium text-slate-800">{d.nama_dokter}</p>
                      <p className="text-slate-500">
                        {[d.spesialis, d.hari_praktik].filter(Boolean).join(" · ")}
                      </p>
                      {d.jam_mulai && d.jam_selesai && (
                        <p className="text-slate-500">
                          {jam(d.jam_mulai)} - {jam(d.jam_selesai)} WIB
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {SITE_NAME}
      </footer>
    </>
  );
}
