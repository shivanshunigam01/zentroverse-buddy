import { api } from "@/lib/api";

export type SmartfloBatchResult = {
  batch_index: number;
  batch_id: string | null;
  status: "success" | "failed";
  uploaded_count: number;
  failed_count: number;
  lead_count: number;
  smartflo_response?: unknown;
  error?: string;
};

export type SmartfloSyncResult = {
  success: boolean;
  syncId: string;
  totalLeads: number;
  uploaded: number;
  failed: number;
  skipped: number;
  batchResults: SmartfloBatchResult[];
};

export async function getSmartfloConfig(): Promise<{ configured: boolean }> {
  return api<{ configured: boolean }>("/admin/smartflo/config");
}

export async function syncLeadsToSmartflo(): Promise<SmartfloSyncResult> {
  return api<SmartfloSyncResult>("/admin/smartflo/sync-leads", {
    method: "POST",
    timeoutMs: 600000,
  });
}

export async function getSmartfloBatchStatus(batchId: string): Promise<{
  batchId: string;
  smartflo: unknown;
  stored: SmartfloBatchResult | null;
  syncId: string | null;
}> {
  return api(`/admin/smartflo/batch-status/${encodeURIComponent(batchId)}`);
}
