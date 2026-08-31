/**
 * CRM API client — server-paginated, separate from bootstrap store.
 */
import { apiRequest, buildApiUrl, getAuthToken, ApiClientError } from "@/lib/api";
import type { ApiResponse } from "@/api/contracts/customers";

async function apiWithMeta<T>(path: string, options?: RequestInit & { json?: unknown }) {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body = options?.body;
  if (options?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }
  const res = await fetch(buildApiUrl(path), {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
    body,
  });
  const parsed = (await res.json()) as ApiResponse<T> & { meta?: PaginatedMeta };
  if (!res.ok) {
    const err = (parsed as { error?: { code?: string; message?: string } }).error;
    throw new ApiClientError(res.status, err?.code ?? "API_ERROR", err?.message ?? "Request failed");
  }
  return { data: parsed.data as T, meta: parsed.meta as PaginatedMeta };
}

export type CrmLeadAttribution = {
  opportunity_id?: string;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  campaign_id?: string | null;
  ad_id?: string | null;
  ad_set_id?: string | null;
  ad_name?: string | null;
  form_id?: string | null;
  external_lead_id?: string | null;
  platform?: string | null;
  landing_page?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  captured_at?: string | null;
  _derived_from_opportunity?: boolean;
};

export type CrmScoreRule = {
  rule_id: string;
  tenant_id?: string | null;
  rule_code: string;
  name: string;
  field?: string | null;
  operator: string;
  expected_value?: string | null;
  points: number;
  version: number;
  active: boolean;
  priority: number;
};

export type CrmLeadRow = {
  opportunity_id: string;
  lead_id: string;
  customer_id: string;
  customer_name?: string;
  customer_mobile?: string;
  customer_email?: string | null;
  product: string;
  variant?: string | null;
  source: string;
  campaign?: string | null;
  current_stage?: string | null;
  lifecycle_stage?: string | null;
  current_micro_stage: string;
  current_owner: string;
  current_action: string;
  next_action: string;
  next_action_date: string;
  status: string;
  score_classification?: string;
  lead_score?: number;
  temperature?: string | null;
  qualification_status?: string | null;
  duplicate_status?: string | null;
  verification_status?: string | null;
  last_activity_at?: string;
  created_at: string;
};

export type CrmFollowup = {
  followup_id: string;
  opportunity_id: string;
  lead_id?: string;
  assigned_to: string;
  followup_type: string;
  scheduled_at: string;
  status: string;
  priority: string;
  remarks?: string | null;
  outcome?: string | null;
  completed_at?: string | null;
};

export type CrmScoreInfo = {
  lead_score: number;
  score_classification: string;
  temperature?: string | null;
  score_reasons: string[];
  score_version: number;
  bands: Array<{ label: string; min: number; max: number }>;
  ledger: Array<Record<string, unknown>>;
  rules?: Array<Record<string, unknown>>;
};

export type CrmDuplicateInfo = {
  opportunity_id: string;
  lead_id: string;
  duplicate_status?: string | null;
  duplicate_group?: string | null;
  window_days: number;
  candidates: Array<CrmLeadRow & { duplicate_classification?: string }>;
};

export type CrmDashboardStats = {
  total_leads: number;
  new_leads: number;
  active_leads: number;
  qualified_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  lost_leads: number;
  retail_delivered: number;
  followups_due: number;
};

export type CrmLead360 = {
  lead: CrmLeadRow;
  customer: Record<string, unknown> | null;
  stage_history: Array<Record<string, unknown>>;
  activities: Array<Record<string, unknown>>;
  communications: Array<Record<string, unknown>>;
  assignment_history: Array<Record<string, unknown>>;
  followups: CrmFollowup[];
  scoring: CrmScoreInfo;
  duplicates: CrmDuplicateInfo | null;
  attribution?: CrmLeadAttribution | null;
};

export type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CrmCustomer = {
  customer_id: string;
  name: string;
  mobile: string;
  email?: string | null;
  city?: string | null;
  created_at: string;
};

export async function fetchCrmDashboard() {
  return apiRequest<CrmDashboardStats>("/crm/dashboard");
}

export async function fetchCrmLeads(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const path = `/crm/leads${qs.toString() ? `?${qs}` : ""}`;
  return apiWithMeta<CrmLeadRow[]>(path);
}

export async function fetchCrmLead360(id: string) {
  return apiRequest<CrmLead360>(`/crm/leads/${encodeURIComponent(id)}`);
}

export async function fetchCrmCustomers(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const path = `/crm/customers${qs.toString() ? `?${qs}` : ""}`;
  return apiWithMeta<CrmCustomer[]>(path);
}

export async function fetchCrmCustomer360(id: string) {
  return apiRequest<{ customer: CrmCustomer; leads: CrmLeadRow[] }>(`/crm/customers/${encodeURIComponent(id)}`);
}

export async function crmChangeStage(id: string, body: { new_micro_stage: string; reason?: string; force?: boolean }) {
  return apiRequest<CrmLeadRow>(`/crm/leads/${encodeURIComponent(id)}/stage`, { method: "POST", json: body });
}

export async function crmAssignLead(id: string, body: { new_owner: string; reason?: string }) {
  return apiRequest<CrmLeadRow>(`/crm/leads/${encodeURIComponent(id)}/assign`, { method: "POST", json: body });
}

export async function fetchCrmFollowups(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const path = `/crm/followups${qs.toString() ? `?${qs}` : ""}`;
  return apiWithMeta<CrmFollowup[]>(path);
}

export async function crmCreateFollowup(leadId: string, body: Record<string, unknown>) {
  return apiRequest<CrmFollowup>(`/crm/leads/${encodeURIComponent(leadId)}/followups`, { method: "POST", json: body });
}

export async function crmUpdateFollowup(followupId: string, body: Record<string, unknown>) {
  return apiRequest<CrmFollowup>(`/crm/followups/${encodeURIComponent(followupId)}`, { method: "PATCH", json: body });
}

export async function crmQualifyLead(leadId: string, notes?: string) {
  return apiRequest<CrmLeadRow>(`/crm/leads/${encodeURIComponent(leadId)}/qualify`, { method: "POST", json: { notes } });
}

export async function crmDisqualifyLead(leadId: string, reason: string) {
  return apiRequest<CrmLeadRow>(`/crm/leads/${encodeURIComponent(leadId)}/disqualify`, { method: "POST", json: { reason } });
}

export async function crmRecalculateScore(leadId: string) {
  return apiRequest<{ lead: CrmLeadRow; score_reasons: string[]; bands: CrmScoreInfo["bands"] }>(
    `/crm/leads/${encodeURIComponent(leadId)}/score/recalculate`,
    { method: "POST" },
  );
}

export async function fetchCrmScoreHistory(leadId: string) {
  return apiRequest<CrmScoreInfo>(`/crm/leads/${encodeURIComponent(leadId)}/score`);
}

export async function fetchCrmDuplicates(leadId: string) {
  return apiRequest<CrmDuplicateInfo>(`/crm/leads/${encodeURIComponent(leadId)}/duplicates`);
}

export async function crmKeepSeparate(leadId: string, reason?: string) {
  return apiRequest<CrmLeadRow>(`/crm/leads/${encodeURIComponent(leadId)}/duplicates/keep-separate`, {
    method: "POST",
    json: { reason },
  });
}

export async function crmLinkDuplicate(leadId: string, target_opportunity_id: string, reason?: string) {
  return apiRequest<{ source: CrmLeadRow; target: CrmLeadRow }>(
    `/crm/leads/${encodeURIComponent(leadId)}/duplicates/link`,
    { method: "POST", json: { target_opportunity_id, reason } },
  );
}

export async function crmMergeDuplicate(leadId: string, target_opportunity_id: string, reason?: string) {
  return apiRequest<{ merged: CrmLeadRow; primary: CrmLeadRow }>(
    `/crm/leads/${encodeURIComponent(leadId)}/duplicates/merge`,
    { method: "POST", json: { target_opportunity_id, reason } },
  );
}

export async function fetchCrmScoreRulesAdmin() {
  return apiRequest<CrmScoreRule[]>("/crm/settings/score-rules");
}

export async function fetchCrmScoreBands() {
  return apiRequest<Array<{ label: string; min: number; max: number }>>("/crm/settings/score-bands");
}

export async function createCrmScoreRule(body: Partial<CrmScoreRule>) {
  return apiRequest<CrmScoreRule>("/crm/settings/score-rules", { method: "POST", json: body });
}

export async function updateCrmScoreRule(ruleId: string, body: Partial<CrmScoreRule>) {
  return apiRequest<CrmScoreRule>(`/crm/settings/score-rules/${encodeURIComponent(ruleId)}`, {
    method: "PATCH",
    json: body,
  });
}

// Integrations
export async function fetchIntegrationsHealth() {
  return apiRequest<Record<string, unknown>>("/integrations/health");
}

export async function startMetaConnect(redirect_after?: string) {
  return apiRequest<{ authorization_url: string; state: string }>("/integrations/meta/connect", {
    method: "POST",
    json: { redirect_after },
  });
}

export async function disconnectMeta() {
  return apiRequest<{ status: string }>("/integrations/meta/disconnect", { method: "POST" });
}

export async function fetchMetaAccounts() {
  return apiRequest<Record<string, unknown>>("/integrations/meta/accounts");
}

export async function fetchMetaForms() {
  return apiRequest<{ forms: Array<Record<string, unknown>> }>("/integrations/meta/forms");
}

export async function startGoogleConnect(redirect_after?: string) {
  return apiRequest<{ authorization_url: string; state: string }>("/integrations/google/connect", {
    method: "POST",
    json: { redirect_after },
  });
}

export async function disconnectGoogle() {
  return apiRequest<{ status: string }>("/integrations/google/disconnect", { method: "POST" });
}

async function journeyList(path: string, params: Record<string, string | number>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
  return apiWithMeta<Array<Record<string, unknown>>>(`${path}?${qs}`);
}

export const fetchCrmTestDrives = (params: Record<string, string | number>) => journeyList("/crm/test-drives", params);
export const fetchCrmQuotations = (params: Record<string, string | number>) => journeyList("/crm/quotations", params);
export const fetchCrmBookings = (params: Record<string, string | number>) => journeyList("/crm/bookings", params);
export const fetchCrmRetail = (params: Record<string, string | number>) => journeyList("/crm/retail", params);
