import type { ActionEngineInput, ActionEngineOutput, ActionRule } from "@/domain/engines/action-engine";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { ContactHealthAttributes } from "@/domain/engines/contact-health";

const DEFAULT_RULES: ActionRule[] = [
  {
    id: "rule-c13-hot-manager-call",
    name: "Hot lead at objection — manager call",
    when: (i) =>
      i.current_micro_stage === "C1.3" &&
      i.lead_score >= 80 &&
      i.customer_behavior.quote_viewed,
    then: () => ({
      next_action: "Manager Call",
      next_owner: "Sales Manager",
      priority: "P1",
      sla: "30 min",
      escalation_owner: "Branch Head",
    }),
  },
  {
    id: "rule-c15-finance-cibil",
    name: "Finance discussion — collect CIBIL",
    when: (i) => i.current_micro_stage === "C1.5",
    then: () => ({
      next_action: "Collect CIBIL Consent",
      next_owner: "Finance Executive",
      priority: "P1",
      sla: "4 hrs",
      escalation_owner: "Finance Manager",
    }),
  },
  {
    id: "rule-sla-breach-escalate",
    name: "SLA breached — escalate",
    when: (i) => i.sla_status === "Breached",
    then: (i) => ({
      next_action: "SLA Recovery Call",
      next_owner: i.customer_behavior.finance_inquiry ? "Finance Executive" : "Sales Executive",
      priority: "P1",
      sla: "15 min",
      escalation_owner: "Branch Head",
    }),
  },
  {
    id: "rule-c0-quote-ready",
    name: "Quote ready gate",
    when: (i) => i.current_micro_stage === "C0.10" && i.lead_score >= 50,
    then: () => ({
      next_action: "Create and Send Quote",
      next_owner: "Sales Executive",
      priority: "P2",
      sla: "1 hr",
      escalation_owner: "Sales Manager",
    }),
  },
  {
    id: "rule-default-followup",
    name: "Default follow-up",
    when: () => true,
    then: (i) => ({
      next_action: "Schedule Follow-up Call",
      next_owner: "Sales Executive",
      priority: i.lead_score >= 80 ? "P1" : "P3",
      sla: "24 hrs",
      escalation_owner: "Sales Manager",
    }),
  },
];

export class ActionEngineService {
  constructor(private rules: ActionRule[] = DEFAULT_RULES) {}

  buildInput(
    opp: OpportunityMaster,
    behavior: Partial<ActionEngineInput["customer_behavior"]> = {},
    contactHealth?: ContactHealthAttributes,
  ): ActionEngineInput {
    const daysSince = (Date.now() - new Date(opp.last_activity_at).getTime()) / (1000 * 60 * 60 * 24);
    return {
      current_stage: opp.current_stage,
      current_micro_stage: opp.current_micro_stage,
      lead_score: opp.lead_score,
      score_classification: opp.score_classification,
      sla_status: opp.sla_status,
      customer_behavior: {
        quote_viewed: behavior.quote_viewed ?? false,
        whatsapp_replied: behavior.whatsapp_replied ?? contactHealth?.whatsapp_active ?? false,
        call_connected: behavior.call_connected ?? contactHealth?.call_reachable ?? false,
        finance_inquiry: behavior.finance_inquiry ?? opp.current_micro_stage === "C1.5",
        objection_raised: behavior.objection_raised ?? opp.current_micro_stage === "C1.3",
        days_since_last_activity: behavior.days_since_last_activity ?? daysSince,
      },
    };
  }

  evaluate(input: ActionEngineInput): ActionEngineOutput {
    for (const rule of this.rules) {
      if (rule.when(input)) {
        return { ...rule.then(input), rule_id: rule.id };
      }
    }
    throw new Error("Action engine: no matching rule");
  }

  applyToOpportunity(
    opp: OpportunityMaster,
    behavior?: Partial<ActionEngineInput["customer_behavior"]>,
  ): Pick<OpportunityMaster, "current_action" | "next_action" | "priority" | "sla" | "escalation_owner" | "current_owner"> {
    const output = this.evaluate(this.buildInput(opp, behavior));
    return {
      current_action: output.next_action,
      next_action: output.next_action,
      current_owner: output.next_owner,
      priority: output.priority,
      sla: output.sla,
      escalation_owner: output.escalation_owner,
    };
  }
}

export const actionEngineService = new ActionEngineService();
