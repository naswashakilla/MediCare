export default function SearchBox({
  placeholder,
  defaultValue,
  children,
}: {
  placeholder: string;
  defaultValue?: string;
  children?: React.ReactNode; // filter tambahan (mis. dropdown status)
}) {
  return (
    <form method="get" className="flex flex-wrap gap-2">
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 sm:w-64"
      />
      {children}
      <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Cari
      </button>
    </form>
  );
}
