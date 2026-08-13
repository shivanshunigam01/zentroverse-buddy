/**
 * Clients for real zentroflow-api Action Engine routes (Express + Mongo).
 * Uses the same VITE_API_URL base as the rest of the SPA (default :8787).
 */

import { api } from "@/lib/api";

export type ActionContext = {
  opportunity_id: string;
  lead_id: string;
  stage: string | null;
  micro_stage: string;
  owner: string;
  current_action: string;
  next_action: string;
  next_action_date: string;
  sla: string;
  sla_due_at: string | null;
  sla_status: string;
  score: number;
  priority: string;
  escalation_owner: string;
  status: string;
  next_stage_path: string | null;
  blockers: string[];
  golden_rule_ok: boolean;
  current_action_record?: {
    id: string;
    action_type: string;
    status: string;
    owner_id: string;
    due_at: string;
    priority: string;
  } | null;
};

export type EngineAction = {
  id: string;
  opportunity_id: string;
  lead_id: string;
  action_type: string;
  status: string;
  priority: string;
  owner_id: string;
  due_at: string;
  micro_stage: string;
  trigger_rule_id: string | null;
};

export type EngineRule = {
  id: string;
  rule_code: string;
  name: string;
  type: string;
  trigger_event: string;
  priority: string;
  status: string;
  current_version: number;
  field_path: string;
  operator: string;
  expected_value: string;
  action_type: string;
  owner_logic: string;
  sla_minutes: number;
  next_stage: string;
};

export async function fetchActionContext(opportunityId: string): Promise<ActionContext> {
  return api<ActionContext>(`/opportunities/${encodeURIComponent(opportunityId)}/action-context`);
}

export async function listEngineActions(owner?: string): Promise<EngineAction[]> {
  const q = owner ? `?owner=${encodeURIComponent(owner)}` : "";
  return api<EngineAction[]>(`/actions${q}`);
}

export async function acceptAction(id: string, actorId = "ui"): Promise<EngineAction> {
  return api<EngineAction>(`/actions/${id}/accept`, { method: "POST", json: { actorId } });
}

export async function completeAction(
  id: string,
  completion: Record<string, unknown> = {},
  actorId = "ui",
): Promise<EngineAction> {
  return api<EngineAction>(`/actions/${id}/complete`, {
    method: "POST",
    json: { actorId, completion },
  });
}

export async function reassignAction(
  id: string,
  newOwner: string,
  reason: string,
): Promise<EngineAction> {
  return api<EngineAction>(`/actions/${id}/reassign`, {
    method: "POST",
    json: { newOwner, reason, actorId: "manager" },
  });
}

export async function listRules(): Promise<EngineRule[]> {
  return api<EngineRule[]>("/rules");
}

export async function createRule(
  body: Partial<EngineRule> & { rule_code: string; name: string; trigger_event: string },
) {
  return api<EngineRule>("/rules", { method: "POST", json: body });
}

export async function simulateRule(id: string) {
  return api<{
    matches: number;
    records_evaluated: number;
    projected_actions: number;
    rule_code: string;
  }>(`/rules/${id}/simulate`, { method: "POST", json: {} });
}

export async function activateRule(id: string) {
  return api<EngineRule>(`/rules/${id}/activate`, {
    method: "POST",
    json: { approvalReference: "UI" },
  });
}

export async function fetchEngineHealth() {
  return api<{
    status: string;
    open_opportunities: number;
    orphan_leads: Array<{ opportunity_id: string; issues: string[] }>;
    queue: Record<string, number>;
  }>("/action-engine/health");
}

export async function ingestEngineEvent(body: {
  eventId: string;
  eventType: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  idempotencyKey: string;
}) {
  return api("/action-engine/events", { method: "POST", json: body });
}

export async function listMasterOrgs() {
  return api<Array<{ organisation_id: string; name: string; oem_brand: string; status: string }>>(
    "/masters/organisations",
  );
}

export async function listMasterBranches() {
  return api<Array<{ branch_id: string; organisation_id: string; name: string; territory: string }>>(
    "/masters/branches",
  );
}

export async function listMasterProducts() {
  return api<Array<{ product_id: string; oem: string; model: string; variant: string; colour: string }>>(
    "/masters/products",
  );
}

export async function listMasterRoles() {
  return api<Array<{ role_id: string; name: string; permissions: string[] }>>("/masters/roles");
}

export async function createMasterOrg(name: string, oem_brand?: string) {
  return api("/masters/organisations", { method: "POST", json: { name, oem_brand } });
}

export async function createMasterProduct(model: string, oem?: string, variant?: string) {
  return api("/masters/products", { method: "POST", json: { model, oem, variant } });
}
