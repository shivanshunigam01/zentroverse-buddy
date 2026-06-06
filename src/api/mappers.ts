import type { CustomerMaster } from "@/domain/entities/customer";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { LeadActivity } from "@/domain/entities/activity";
import type { OpportunityDto } from "@/api/contracts/opportunities";

function iso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  return new Date(value as string | number).toISOString();
}

export function mapCustomer(raw: Record<string, unknown>): CustomerMaster {
  return {
    customer_id: String(raw.customer_id),
    name: String(raw.name),
    mobile: String(raw.mobile),
    mobile_normalized: String(raw.mobile_normalized ?? raw.mobile),
    email: raw.email ? String(raw.email) : null,
    address: raw.address ? String(raw.address) : null,
    customer_type: (raw.customer_type as CustomerMaster["customer_type"]) ?? "Individual",
    created_at: iso(raw.created_at),
    updated_at: iso(raw.updated_at),
  };
}

export function mapOpportunity(raw: OpportunityDto | Record<string, unknown>): OpportunityMaster {
  const o = raw as OpportunityDto;
  return {
    opportunity_id: o.opportunity_id,
    lead_id: o.lead_id ?? o.opportunity_id,
    customer_id: o.customer_id,
    product: o.product,
    variant: o.variant ?? null,
    requirement: o.requirement ?? null,
    opportunity_type: o.opportunity_type ?? "New",
    current_stage: o.current_stage ?? "C0",
    lifecycle_stage: o.lifecycle_stage ?? null,
    current_micro_stage: o.current_micro_stage,
    current_owner: o.current_owner,
    current_action: o.current_action,
    next_action: o.next_action,
    next_action_date: iso(o.next_action_date),
    priority: o.priority,
    lead_score: o.lead_score ?? 0,
    score_classification: o.score_classification ?? "Cold",
    sla: o.sla ?? "24 hours",
    sla_due_at: o.sla_due_at ? iso(o.sla_due_at) : null,
    sla_status: o.sla_status ?? "On Track",
    escalation_owner: o.escalation_owner ?? "Sales Manager",
    status: o.status ?? "Open",
    source: o.source ?? "Manual",
    campaign: o.campaign ?? null,
    branch: o.branch ?? "Default Branch",
    last_activity_at: iso(o.last_activity_at),
    created_at: iso(o.created_at),
    updated_at: iso(o.updated_at),
    stage_step_data: (o.stage_step_data as OpportunityMaster["stage_step_data"]) ?? {},
  };
}

function mapActivityType(type: unknown): LeadActivity["activity_type"] {
  const t = String(type ?? "");
  if (t.includes("stage")) return "Stage Change";
  if (t.includes("whatsapp") || t.includes("bot")) return "WhatsApp";
  if (t.includes("call")) return "Call";
  return "System";
}

export function mapActivity(raw: Record<string, unknown>): LeadActivity {
  return {
    activity_id: String(raw._id ?? raw.activity_id ?? `${raw.opportunity_id}-${raw.created_at}`),
    opportunity_id: String(raw.opportunity_id),
    activity_type: mapActivityType(raw.type),
    remarks: String(raw.description ?? raw.title ?? raw.type ?? ""),
    created_by: String(raw.changed_by ?? "System"),
    created_at: iso(raw.created_at),
  };
}

export function customerFromOpportunityDto(dto: OpportunityDto): CustomerMaster | null {
  if (!dto.customer_name || !dto.customer_mobile) return null;
  return {
    customer_id: dto.customer_id,
    name: dto.customer_name,
    mobile: dto.customer_mobile,
    mobile_normalized: dto.customer_mobile.replace(/\D/g, "").slice(-10),
    email: null,
    address: null,
    customer_type: "Individual",
    created_at: iso(dto.created_at),
    updated_at: iso(dto.updated_at),
  };
}
