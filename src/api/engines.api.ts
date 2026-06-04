import { api } from "@/lib/api";
import { mapOpportunity } from "@/api/mappers";
import type { OpportunityMaster } from "@/domain/entities/opportunity";

export async function verifyContact(body: {
  opportunity_id: string;
  mobile: string;
  district?: string;
}) {
  return api<Record<string, unknown>>("/engines/contact-health/verify", {
    method: "POST",
    json: body,
  });
}

const SCORE_EVENT_MAP: Record<string, string> = {
  "call.answered": "contact_verified",
  "bot.replied": "bot_engaged",
  "lead.qualified": "lead_qualified",
  "quote.inquiry": "quote_shared",
  "demo.completed": "lead_qualified",
  "contact.invalid": "contact_verified",
};

export async function applyScore(body: {
  opportunity_id: string;
  event: string;
}): Promise<OpportunityMaster> {
  const event_type = SCORE_EVENT_MAP[body.event] ?? body.event.replace(/\./g, "_");
  const raw = await api<Record<string, unknown>>("/engines/scoring/apply", {
    method: "POST",
    json: { opportunity_id: body.opportunity_id, event_type },
  });
  return mapOpportunity(raw);
}

export async function getSlaState(opportunityId: string) {
  return api<Record<string, unknown>>(`/engines/sla/${opportunityId}`);
}

export async function runActionEngine(opportunityId: string): Promise<OpportunityMaster> {
  const raw = await api<Record<string, unknown>>("/engines/action/run", {
    method: "POST",
    json: { opportunity_id: opportunityId },
  });
  return mapOpportunity(raw);
}
