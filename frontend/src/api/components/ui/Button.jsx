export default function Button({ children, variant="primary", className="", ...props }) {
  const base = "rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-50";
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    ghost:   "bg-white border border-gray-300 hover:bg-gray-50"
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</button>;
}
