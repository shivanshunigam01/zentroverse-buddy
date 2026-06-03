import {
  SCORING_RULES,
  classifyScore,
  type ScoreLedgerEntry,
} from "@/domain/engines/scoring";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import { eventBus, createCorrelationId } from "@/domain/events/event-bus";

export function applyScoreEvent(
  opp: OpportunityMaster,
  eventType: string,
): { opportunity: OpportunityMaster; ledger: ScoreLedgerEntry } {
  const rule = SCORING_RULES.find((r) => r.event === eventType);
  if (!rule) {
    throw new Error(`Unknown scoring event: ${eventType}`);
  }

  const newScore = Math.max(0, opp.lead_score + rule.points);
  const now = new Date().toISOString();

  const ledger: ScoreLedgerEntry = {
    id: `scr_${Date.now()}`,
    opportunity_id: opp.opportunity_id,
    event: eventType,
    points: rule.points,
    running_total: newScore,
    created_at: now,
  };

  const opportunity: OpportunityMaster = {
    ...opp,
    lead_score: newScore,
    score_classification: classifyScore(newScore),
    last_activity_at: now,
    updated_at: now,
  };

  void eventBus.publish({
    type: "score.updated",
    opportunity_id: opp.opportunity_id,
    customer_id: opp.customer_id,
    payload: { ledger, new_score: newScore },
    occurred_at: now,
    correlation_id: createCorrelationId(),
  });

  return { opportunity, ledger };
}

export const scoringService = { applyScoreEvent };
