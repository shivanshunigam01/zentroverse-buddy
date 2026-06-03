import { SLA_POLICIES, type SlaEngineState } from "@/domain/engines/sla";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import { eventBus, createCorrelationId } from "@/domain/events/event-bus";

function matchPolicy(opp: OpportunityMaster) {
  return (
    SLA_POLICIES.find(
      (p) =>
        (p.micro_stage === "*" || p.micro_stage === opp.current_micro_stage) &&
        (p.priority === "*" || p.priority === opp.priority),
    ) ?? SLA_POLICIES[0]
  );
}

export function computeSlaState(opp: OpportunityMaster): SlaEngineState {
  const policy = matchPolicy(opp);
  const dueAt = new Date(Date.now() + policy.duration_minutes * 60 * 1000).toISOString();
  return {
    opportunity_id: opp.opportunity_id,
    policy_id: policy.id,
    due_at: dueAt,
    status: opp.sla_status,
    breached_at: opp.sla_status === "Breached" ? new Date().toISOString() : null,
  };
}

export function evaluateSlaStatus(opp: OpportunityMaster): OpportunityMaster {
  if (!opp.sla_due_at) return opp;
  const breached = new Date(opp.sla_due_at).getTime() < Date.now();
  const atRisk =
    !breached &&
    new Date(opp.sla_due_at).getTime() - Date.now() < 30 * 60 * 1000;

  const sla_status = breached ? "Breached" : atRisk ? "At Risk" : "On Track";
  const updated = { ...opp, sla_status, updated_at: new Date().toISOString() };

  if (breached && opp.sla_status !== "Breached") {
    void eventBus.publish({
      type: "sla.breached",
      opportunity_id: opp.opportunity_id,
      customer_id: opp.customer_id,
      payload: { sla_due_at: opp.sla_due_at },
      occurred_at: updated.updated_at,
      correlation_id: createCorrelationId(),
    });
  }

  return updated;
}

export const slaService = { computeSlaState, evaluateSlaStatus };
