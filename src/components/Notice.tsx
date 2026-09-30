export default function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mb-4 rounded-lg px-3 py-2 text-sm ${error ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-800"}`}
    >
      {error ?? ok}
    </div>
  );
}
