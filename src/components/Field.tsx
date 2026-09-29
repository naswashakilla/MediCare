type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Field({ label, error, id, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
