export default function Select({ label, options=[], error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500
                    ${error ? "border-red-400" : "border-gray-300 bg-white"}`}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
