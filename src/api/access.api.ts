import { api } from "@/lib/api";

export type ModuleAccess = Record<string, { allowed: boolean; reason?: string }>;

export async function fetchModuleAccess(): Promise<ModuleAccess> {
  return api<ModuleAccess>("/access/modules");
}
