const API_URL = (
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export async function api(path, options = {}) {
  const {
    token,
    method = "GET",
    body,
    headers: customHeaders = {},
  } = options;

  // Normalize the API path and add /api exactly once.
  const cleanPath = String(path).replace(/^\/+/, "");
  const apiPath = cleanPath.startsWith("api/")
    ? cleanPath
    : `api/${cleanPath}`;

  const requestUrl = `${API_URL}/${apiPath}`;

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
    response = await fetch(requestUrl, {
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
    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error
        : data;

    throw new Error(
      message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

// Required by LinkCard.jsx to generate public short links.
export function shortUrl(code) {
  const normalizedCode = String(code ?? "").trim();

  if (!normalizedCode) {
    return "";
  }

  return `${API_URL}/${encodeURIComponent(normalizedCode)}`;
}