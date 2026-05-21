export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${getBackendUrl()}${path}`, { ...options, headers });
}
