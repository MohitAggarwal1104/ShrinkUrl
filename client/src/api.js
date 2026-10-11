// const API_BASE = import.meta.env.VITE_API_URL || "shrink-url-six.vercel.app";

// export function shortUrl(code) {
//   return `${API_BASE}/${code}`;
// }

// export async function api(path, { token, ...options } = {}) {
//   const response = await fetch(`${API_BASE}/api${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...(options.headers || {})
//     }
//   });
//   const data = await response.json().catch(() => ({}));
//   if (!response.ok) throw new Error(data.message || "Request failed.");
//   return data;
// }
const API_URL = (
  import.meta.env.VITE_SERVER_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

export async function api(path, options = {}) {
  const { token, method = "GET", body, headers: customHeaders = {} } = options;

  // Keep API paths relative to the backend base URL.
  const normalizedPath = `/${String(path).replace(/^\/+/, "")}`;

  const headers = {
    Accept: "application/json",
    ...customHeaders,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${normalizedPath}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : typeof body === "string"
            ? body
            : JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to connect to the backend.");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data !== null
        ? data.message || data.error || `HTTP ${response.status}`
        : data || `HTTP ${response.status}`
    );
  }

  return data;
}