const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

export async function api(path, { method="GET", body, token, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": body instanceof FormData ? undefined : "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson ? (data.message || data.error || "Error") : data;
    throw new Error(message || `HTTP ${res.status}`);
  }
  return data;
}
