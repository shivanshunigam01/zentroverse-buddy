import { api, setAuthToken } from "@/lib/api";

export type AuthUser = { id?: string; email: string; name: string; role: string };

const USER_KEY = "zentroflow_user";

export async function register(
  email: string,
  password: string,
  name?: string,
): Promise<AuthUser> {
  const data = await api<{ token: string; user: AuthUser }>("/auth/register", {
    method: "POST",
    json: { email, password, name },
  });
  setAuthToken(data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await api<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    json: { email, password },
  });
  setAuthToken(data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function getCurrentUserName(): string {
  try {
    const u = JSON.parse(localStorage.getItem(USER_KEY) ?? "null") as AuthUser | null;
    return u?.name ?? "Sales Executive";
  } catch {
    return "Sales Executive";
  }
}

export async function fetchMe(): Promise<AuthUser> {
  return api<AuthUser>("/auth/me");
}

export function logout(): void {
  setAuthToken(null);
  localStorage.removeItem(USER_KEY);
}
