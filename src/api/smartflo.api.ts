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

export async function getSmartfloConfig(): Promise<{
  configured: boolean;
  clickToCallConfigured?: boolean;
  directAgentCallConfigured?: boolean;
  ivrId?: string;
}> {
  return api("/admin/smartflo/config");
}

/** IVR Click-to-Call Support — POST /smartflo/call (unchanged) */
export async function initiateSmartfloIvrCall(body: {
  phoneNumber: string;
  opportunityId?: string;
  customerName?: string;
}): Promise<{
  success: boolean;
  message: string;
  phoneNumber: string;
  ivrId?: string;
  smartflo?: unknown;
}> {
  return api("/smartflo/call", {
    method: "POST",
    json: body,
  });
}

/** Direct agent Click-to-Call — POST /smartflo/agent-call */
export async function initiateSmartfloAgentCall(body: {
  phoneNumber: string;
  opportunityId?: string;
  customerName?: string;
}): Promise<{
  success: boolean;
  message: string;
  phoneNumber: string;
  agentNumber?: string;
  smartflo?: unknown;
}> {
  return api("/smartflo/agent-call", {
    method: "POST",
    json: body,
  });
}

/** @deprecated Use initiateSmartfloIvrCall */
export const triggerSmartfloIvrCall = initiateSmartfloIvrCall;

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
