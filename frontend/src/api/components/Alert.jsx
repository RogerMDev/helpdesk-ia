export default function Alert({ type="info", children }) {
  const colors = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    error:"bg-red-50 text-red-700 border-red-200",
    success:"bg-green-50 text-green-700 border-green-200",
  };
  return <div className={`border rounded-xl px-4 py-3 ${colors[type]}`}>{children}</div>;
}
