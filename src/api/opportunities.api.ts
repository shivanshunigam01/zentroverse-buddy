import { api } from "@/lib/api";
import { mapActivity, mapOpportunity } from "@/api/mappers";
import type { OpportunityDto } from "@/api/contracts/opportunities";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { MicroStageCode } from "@/domain/stages/types";
import type { LeadActivity } from "@/domain/entities/activity";

export async function listOpportunities(limit = 500): Promise<OpportunityMaster[]> {
  const rows = await api<OpportunityDto[]>(`/opportunities?limit=${limit}`);
  return rows.map(mapOpportunity);
}

export async function getOpportunity(opportunityId: string): Promise<OpportunityMaster> {
  const dto = await api<OpportunityDto>(`/opportunities/${opportunityId}`);
  return mapOpportunity(dto);
}

export async function runAction(
  opportunityId: string,
  body: { action_label: string; changed_by: string; force?: boolean; reason?: string },
): Promise<OpportunityMaster> {
  const dto = await api<OpportunityDto>(`/opportunities/${opportunityId}/actions`, {
    method: "POST",
    json: body,
  });
  return mapOpportunity(dto);
}

export async function stageTransition(
  opportunityId: string,
  body: { new_micro_stage: MicroStageCode; changed_by: string; force?: boolean; reason?: string },
): Promise<OpportunityMaster> {
  const dto = await api<OpportunityDto>(`/opportunities/${opportunityId}/stage-transition`, {
    method: "POST",
    json: body,
  });
  return mapOpportunity(dto);
}

export async function getActivities(opportunityId: string): Promise<LeadActivity[]> {
  const rows = await api<Record<string, unknown>[]>(`/opportunities/${opportunityId}/activities`);
  return rows.map((r) => mapActivity(r));
}

export async function patchOpportunity(
  opportunityId: string,
  body: Partial<{
    current_owner: string;
    current_action: string;
    next_action: string;
    priority: string;
    status: string;
    branch: string;
    requirement: string;
  }>,
): Promise<OpportunityMaster> {
  const dto = await api<OpportunityDto>(`/opportunities/${opportunityId}`, {
    method: "PATCH",
    json: body,
  });
  return mapOpportunity(dto);
}

export async function manualEditLead(
  opportunityId: string,
  body: Record<string, unknown>,
): Promise<OpportunityMaster> {
  const dto = await api<Record<string, unknown>>(`/opportunities/${opportunityId}/manual-edit`, {
    method: "POST",
    json: body,
  });
  return mapOpportunity(dto);
}
