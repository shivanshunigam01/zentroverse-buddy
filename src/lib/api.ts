/**
 * Centralized HTTP client for ZentroFlow backend.
 * Base URL from VITE_API_URL (e.g. https://flow.zentroverse.com or …/api/v1).
 */

import type { ApiResponse } from "@/api/contracts/customers";

const TOKEN_KEY = "zentroflow_token";

/** Normalize env base: trim slashes, append /api/v1 when omitted */
export function resolveApiBaseUrl(raw?: string): string {
  const fallback = "http://localhost:8787";
  const input = (raw ?? fallback).trim().replace(/\/+$/, "");
  if (/\/api\/v\d+$/i.test(input)) return input;
  return `${input}/api/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_URL);

const API_DEBUG =
  import.meta.env.DEV === true || import.meta.env.VITE_API_DEBUG === "true";

/** Join base + path without duplicate slashes */
export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export class ApiClientError extends Error {
  code: string;
  field?: string;
  status: number;

  constructor(status: number, code: string, message: string, field?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

type ApiErrorBody = {
  error?: { code?: string; message?: string; field?: string };
  message?: string;
};

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function messageFromStatus(status: number, backendMessage?: string): string {
  if (backendMessage?.trim()) return backendMessage.trim();
  const defaults: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Session expired or invalid. Please sign in again.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This action conflicts with existing data.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please try again shortly.",
    500: "Server error. Please try again later.",
  };
  return defaults[status] ?? `Request failed (${status})`;
}

function throwApiError(status: number, body: unknown): never {
  const payload = body as ApiErrorBody;
  const err = payload.error;
  const code = err?.code ?? "API_ERROR";
  const message = messageFromStatus(status, err?.message ?? payload.message);
  throw new ApiClientError(status, code, message, err?.field);
}

function debugLog(label: string, data: Record<string, unknown>): void {
  if (!API_DEBUG) return;
  console.debug(`[ZentroFlow API] ${label}`, data);
}

export type ApiRequestOptions = RequestInit & {
  json?: unknown;
  /** Set true only if backend uses cookie sessions */
  withCredentials?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { json, withCredentials, headers: extraHeaders, ...init } = options;
  const method = (init.method ?? (json !== undefined ? "POST" : "GET")).toUpperCase();
  const url = buildApiUrl(path);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(extraHeaders as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body = init.body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  debugLog("request", { method, url });

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      method,
      headers,
      body,
      credentials: withCredentials ? "include" : "omit",
    });
  } catch (cause) {
    debugLog("network-error", { method, url, cause });
    const hint =
      cause instanceof TypeError && /fetch/i.test(cause.message)
        ? "Cannot reach the API. Check your internet connection and that the server is running."
        : "Network request failed.";
    throw new ApiClientError(0, "NETWORK_ERROR", hint);
  }

  const parsed = await parseJsonSafe(res);
  debugLog("response", { method, url, status: res.status, body: parsed });

  if (!res.ok) throwApiError(res.status, parsed);

  const data = (parsed as ApiResponse<T>).data;
  return data as T;
}

/** @deprecated Use apiRequest — kept as alias for existing modules */
export const api = apiRequest;

export async function apiBlob(path: string, options: ApiRequestOptions = {}): Promise<Blob> {
  const method = (options.method ?? "GET").toUpperCase();
  const url = buildApiUrl(path);
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  debugLog("request", { method, url, blob: true });

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      method,
      headers,
      credentials: options.withCredentials ? "include" : "omit",
    });
  } catch {
    throw new ApiClientError(0, "NETWORK_ERROR", "Cannot reach the API. Check your connection.");
  }

  if (!res.ok) {
    const parsed = await parseJsonSafe(res);
    debugLog("response", { method, url, status: res.status, body: parsed });
    throwApiError(res.status, parsed);
  }

  debugLog("response", { method, url, status: res.status, body: "[blob]" });
  return res.blob();
}
