import { api } from "@/lib/api";
import type {
  DialerCall,
  DialerCampaign,
  DialerCampaignStatus,
  DialerCurrentCall,
  DialerDisposition,
  DialerDispositionPayload,
  DialerHealth,
  DialerLeadRow,
  DialerLeadSyncStats,
  DialerSessionStatus,
  DialerStatistics,
  DialerSyncAllResult,
  DialerSyncJob,
  DialerSyncResult,
  DialerTestLead,
} from "@/domain/dialer/types";

export function getDialerHealth(): Promise<DialerHealth> {
  return api("/dialer/health");
}

export function getDialerCampaign(): Promise<DialerCampaign> {
  return api("/dialer/campaign");
}

export function getDialerCampaignStatus(): Promise<DialerCampaignStatus> {
  return api("/dialer/campaign/status");
}

export function getDialerLeads(syncStatus?: string): Promise<DialerLeadRow[]> {
  const q = syncStatus ? `?limit=200&syncStatus=${encodeURIComponent(syncStatus)}` : "?limit=200";
  return api(`/dialer/leads${q}`);
}

export function syncDialerLead(id: string, resync = false): Promise<DialerSyncResult> {
  return api(`/dialer/leads/${encodeURIComponent(id)}/sync`, {
    method: "POST",
    json: resync ? { resync: true } : {},
  });
}

export function syncPendingDialerLeads(): Promise<{ total: number; results: DialerSyncResult[] }> {
  return api("/dialer/leads/sync", { method: "POST", timeoutMs: 600000 });
}

export function getDialerLeadSyncStats(): Promise<DialerLeadSyncStats> {
  return api("/dialer/leads/sync/stats");
}

export function syncAllDialerLeads(): Promise<DialerSyncAllResult> {
  return api("/dialer/leads/sync-all", {
    method: "POST",
    timeoutMs: 600000,
  });
}

export function syncSelectedDialerLeads(
  leadIds: string[],
  resync = false,
): Promise<{
  success?: boolean;
  syncId: string;
  total: number;
  synced?: number;
  uploaded: number;
  failed: number;
  alreadySynced?: number;
  skipped?: number;
  results: DialerSyncResult[];
  status: string;
}> {
  return api("/dialer/leads/sync", {
    method: "POST",
    json: { leadIds, resync },
    timeoutMs: 600000,
  });
}

export function retryFailedDialerLeads(): Promise<{
  syncId: string;
  total: number;
  uploaded: number;
  failed: number;
  results: DialerSyncResult[];
  status: string;
}> {
  return api("/dialer/leads/sync", {
    method: "POST",
    json: { retryFailed: true },
    timeoutMs: 600000,
  });
}

export function getDialerSyncJob(syncId: string): Promise<DialerSyncJob> {
  return api(`/dialer/sync-jobs/${encodeURIComponent(syncId)}`);
}

export function getDialerStatistics(): Promise<DialerStatistics> {
  return api("/dialer/statistics");
}

export function getDialerCurrentCall(): Promise<DialerCurrentCall> {
  return api("/dialer/current-call");
}

export function getDialerDispositions(): Promise<DialerDisposition[]> {
  return api("/dialer/dispositions");
}

export function storeDialerDisposition(
  body: DialerDispositionPayload,
): Promise<{ uniqueId: string; disposition: string; known: boolean; callId?: string | null }> {
  return api("/dialer/disposition", { method: "POST", json: body });
}

export function storeCallDisposition(
  callId: string,
  body: Omit<DialerDispositionPayload, "callId">,
): Promise<{ uniqueId: string; disposition: string; known: boolean }> {
  return api(`/dialer/calls/${encodeURIComponent(callId)}/disposition`, {
    method: "POST",
    json: body,
  });
}

export function getDialerCalls(): Promise<DialerCall[]> {
  return api("/dialer/calls?limit=50");
}

export function getDialerCallbacks(): Promise<DialerLeadRow[]> {
  return api("/dialer/callbacks");
}

export function getDialerSessionStatus(): Promise<DialerSessionStatus> {
  return api("/dialer/session/status");
}

export function startDialerSession(): Promise<{ status: string; active?: boolean }> {
  return api("/dialer/session/start", { method: "POST" });
}

export function endDialerSession(): Promise<{ status: string; active?: boolean }> {
  return api("/dialer/session/end", { method: "POST" });
}

export function logoutDialerSession(): Promise<{ status: string; active?: boolean }> {
  return api("/dialer/session/logout", { method: "POST" });
}

export function testSyncLead(leadId: string): Promise<DialerSyncResult> {
  return api("/dialer/test/sync-lead", { method: "POST", json: { leadId } });
}

export function testLeadStatus(leadId: string): Promise<DialerTestLead> {
  return api(`/dialer/test/lead/${encodeURIComponent(leadId)}`);
}

export function fetchDialerLeadLists(): Promise<unknown> {
  return api("/dialer/lead-lists");
}

export function fetchRemoteLeads(listId: string): Promise<unknown> {
  return api(`/dialer/lead-lists/${encodeURIComponent(listId)}/leads`);
}
