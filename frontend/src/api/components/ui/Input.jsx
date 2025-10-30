export default function Input({ label, type="text", error, className="", ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500
                   ${error ? "border-red-400" : "border-gray-300 bg-white"}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
