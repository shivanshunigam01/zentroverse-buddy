import type { CustomerMaster } from "@/domain/entities/customer";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import { C0_MICRO_STAGES, C1_MICRO_STAGES, C1A_MICRO_STAGES, C2_MICRO_STAGES, C3_MICRO_STAGES } from "@/domain/stages/business-stages";

const MICRO_TITLE: Record<string, string> = [
  ...C0_MICRO_STAGES,
  ...C1_MICRO_STAGES,
  ...C1A_MICRO_STAGES,
  ...C2_MICRO_STAGES,
  ...C3_MICRO_STAGES,
].reduce(
  (acc, s) => {
    acc[s.code] = `${s.code} ${s.title}`;
    return acc;
  },
  {} as Record<string, string>,
);

function formatNextActionDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  return d.toLocaleDateString("en-IN", { weekday: "short", hour: "numeric", minute: "2-digit" });
}

function slaCountdown(opp: OpportunityMaster): string | undefined {
  if (!opp.sla_due_at) return undefined;
  if (opp.sla_status === "Breached") return "Overdue";
  const ms = new Date(opp.sla_due_at).getTime() - Date.now();
  if (ms <= 0) return "Overdue";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * UI view model — maps opportunity_master + customer_master to existing Lead card/table shape.
 * No layout changes; only data binding layer.
 */
export type Lead = {
  leadId: string;
  customerId: string;
  opportunityId: string;
  customerName: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  district: string;
  product: string;
  source: string;
  campaign?: string;
  branch: string;
  leadType: string;
  /** Reportable sales stage */
  currentStage: string;
  /** Business micro stage label */
  microStage: string;
  /** Exact micro stage code for filtering e.g. C0.5 */
  microStageCode: string;
  leadScore: number;
  scoreLabel: "Cold" | "Warm" | "Hot" | "Critical";
  priority: OpportunityMaster["priority"];
  currentOwner: string;
  currentAction: string;
  nextAction: string;
  nextActionAt: string;
  slaTime: string;
  slaCountdown?: string;
  escalationOwner: string;
  status: OpportunityMaster["status"];
};

export function opportunityToLead(opp: OpportunityMaster, customer: CustomerMaster): Lead {
  const stage = opp.lifecycle_stage ?? opp.current_stage ?? "C0";
  const microLabel = MICRO_TITLE[opp.current_micro_stage] ?? opp.current_micro_stage;

  return {
    leadId: opp.lead_id ?? opp.opportunity_id,
    customerId: customer.customer_id,
    opportunityId: opp.opportunity_id,
    customerName: customer.name,
    mobile: customer.mobile,
    email: customer.email ?? undefined,
    district: customer.address?.split(",")[0] ?? "",
    product: opp.product,
    source: opp.source,
    campaign: opp.campaign ?? undefined,
    branch: opp.branch,
    leadType: `${opp.opportunity_type} Opportunity`,
    currentStage: stage,
    microStage: microLabel,
    microStageCode: opp.current_micro_stage,
    leadScore: opp.lead_score,
    scoreLabel: opp.score_classification,
    priority: opp.priority,
    currentOwner: opp.current_owner,
    currentAction: opp.current_action,
    nextAction: opp.next_action,
    nextActionAt: formatNextActionDate(opp.next_action_date),
    slaTime: opp.sla,
    slaCountdown: slaCountdown(opp),
    escalationOwner: opp.escalation_owner,
    status: opp.status,
  };
}

export function opportunitiesToLeads(
  opportunities: OpportunityMaster[],
  customers: Record<string, CustomerMaster>,
): Lead[] {
  return opportunities
    .map((o) => {
      const c = customers[o.customer_id];
      if (!c) return null;
      return opportunityToLead(o, c);
    })
    .filter((l): l is Lead => l !== null);
}
