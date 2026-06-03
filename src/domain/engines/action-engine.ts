import type { PriorityCode } from "@/domain/entities/opportunity";
import type { MicroStageCode } from "@/domain/stages/types";
import type { ScoreClassification } from "./scoring";

/** Action Engine — computes next action from stage + engines; NOT a funnel stage */

export interface ActionEngineInput {
  current_stage: string | null;
  current_micro_stage: MicroStageCode;
  lead_score: number;
  score_classification: ScoreClassification;
  customer_behavior: CustomerBehaviorSignals;
  sla_status: "On Track" | "At Risk" | "Breached";
}

export interface CustomerBehaviorSignals {
  quote_viewed: boolean;
  whatsapp_replied: boolean;
  call_connected: boolean;
  finance_inquiry: boolean;
  objection_raised: boolean;
  days_since_last_activity: number;
}

export interface ActionEngineOutput {
  next_action: string;
  next_owner: string;
  priority: PriorityCode;
  sla: string;
  escalation_owner: string;
  rule_id: string;
}

export interface ActionRule {
  id: string;
  name: string;
  when: (input: ActionEngineInput) => boolean;
  then: (input: ActionEngineInput) => Omit<ActionEngineOutput, "rule_id">;
}

export const ACTION_ENGINE_ID = "action-engine" as const;
