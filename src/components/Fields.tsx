const dasar =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500";

type Base = { label: string; error?: string };

export function SelectField({
  label,
  error,
  id,
  children,
  ...props
}: Base & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const inputId = id ?? props.name;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select id={inputId} aria-invalid={!!error} className={`${dasar} ${error ? "border-red-400" : "border-slate-300"}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function TextareaField({
  label,
  error,
  id,
  ...props
}: Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? props.name;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea id={inputId} aria-invalid={!!error} rows={3} className={`${dasar} ${error ? "border-red-400" : "border-slate-300"}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
