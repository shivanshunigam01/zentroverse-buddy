import type { ApiResponse } from "@/api/contracts/customers";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8787/api/v1";

export class ApiClientError extends Error {
  code: string;
  field?: string;
  status: number;

  constructor(status: number, code: string, message: string, field?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem("zentroflow_token");
}

export function setAuthToken(token: string | null): void {
  if (token) localStorage.setItem("zentroflow_token", token);
  else localStorage.removeItem("zentroflow_token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body = options.body;
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers, body });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = json.error ?? {};
    throw new ApiClientError(
      res.status,
      err.code ?? "API_ERROR",
      err.message ?? res.statusText,
      err.field,
    );
  }

  return (json as ApiResponse<T>).data;
}

export async function apiBlob(path: string): Promise<Blob> {
  const token = getAuthToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiClientError(res.status, "API_ERROR", res.statusText);
  return res.blob();
}
