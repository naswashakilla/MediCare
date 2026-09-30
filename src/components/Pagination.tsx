import Link from "next/link";
import { PAGE_SIZE, buatUrl } from "@/lib/query";

export default function Pagination({
  basePath,
  page,
  total,
  params = {},
}: {
  basePath: string;
  page: number;
  total: number;
  params?: Record<string, string | undefined>;
}) {
  const totalHalaman = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const btn = "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50";
  const mati = "rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-300";

  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
      <span>
        {total} data · halaman {Math.min(page, totalHalaman)} dari {totalHalaman}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link className={btn} href={buatUrl(basePath, { ...params, page: page - 1 })}>
            Sebelumnya
          </Link>
        ) : (
          <span className={mati}>Sebelumnya</span>
        )}
        {page < totalHalaman ? (
          <Link className={btn} href={buatUrl(basePath, { ...params, page: page + 1 })}>
            Berikutnya
          </Link>
        ) : (
          <span className={mati}>Berikutnya</span>
        )}
      </div>
    </div>
  );
}
