import { api } from "@/lib/api";
import type {
  DialerCall,
  DialerCampaign,
  DialerCampaignStatus,
  DialerDisposition,
  DialerHealth,
  DialerLeadRow,
  DialerLeadSyncStats,
  DialerSessionStatus,
  DialerSyncAllResult,
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

export function getDialerLeads(): Promise<DialerLeadRow[]> {
  return api("/dialer/leads?limit=100");
}

export function syncDialerLead(id: string): Promise<DialerSyncResult> {
  return api(`/dialer/leads/${encodeURIComponent(id)}/sync`, { method: "POST" });
}

export function syncPendingDialerLeads(): Promise<{ total: number; results: DialerSyncResult[] }> {
  return api("/dialer/leads/sync", { method: "POST", timeoutMs: 600000 });
}

export function getDialerLeadSyncStats(): Promise<DialerLeadSyncStats> {
  return api("/dialer/leads/sync/stats");
}

export function syncAllDialerLeads(): Promise<DialerSyncAllResult> {
  return api("/dialer/leads/sync", {
    method: "POST",
    json: { syncAll: true },
    timeoutMs: 600000,
  });
}

export function getDialerDispositions(): Promise<DialerDisposition[]> {
  return api("/dialer/dispositions");
}

export function storeDialerDisposition(body: {
  leadId?: string;
  callId?: string;
  dispositionStatus: string;
  subDispositionStatus?: string;
  note?: string;
}): Promise<{ uniqueId: string; disposition: string; known: boolean }> {
  return api("/dialer/disposition", { method: "POST", json: body });
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

export function startDialerSession(): Promise<{ status: string }> {
  return api("/dialer/session/start", { method: "POST" });
}

export function endDialerSession(): Promise<{ status: string }> {
  return api("/dialer/session/end", { method: "POST" });
}

export function logoutDialerSession(): Promise<{ status: string }> {
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
