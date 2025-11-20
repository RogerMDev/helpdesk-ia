export default function Input({ label, type = "text", error, className = "", as = "input", children, ...props }) {
  const baseClasses = `w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? "border-red-400" : "border-gray-300 bg-white"
  }`

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      {as === "select" ? (
        <select className={baseClasses} {...props}>
          {children}
        </select>
      ) : (
        <input type={type} className={baseClasses} {...props} />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
