const warna: Record<string, string> = {
  menunggu: "bg-amber-50 text-amber-700",
  dikonfirmasi: "bg-sky-50 text-sky-700",
  selesai: "bg-emerald-50 text-emerald-700",
  dibatalkan: "bg-slate-100 text-slate-500",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${warna[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
