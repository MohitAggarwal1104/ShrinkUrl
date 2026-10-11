const API_BASE = import.meta.env.VITE_API_URL || "shrink-url-7ja5.vercel.app";

export function shortUrl(code) {
  return `${API_BASE}/${code}`;
}

export async function api(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
