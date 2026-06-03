import type { PriorityCode } from "@/domain/entities/opportunity";
import type { MicroStageCode } from "@/domain/stages/types";

/** SLA Engine — parallel timing enforcement */

export interface SlaPolicy {
  id: string;
  micro_stage: MicroStageCode | "*";
  priority: PriorityCode | "*";
  duration_minutes: number;
  escalation_owner: string;
}

export const SLA_POLICIES: readonly SlaPolicy[] = [
  { id: "sla-p1-hot", micro_stage: "*", priority: "P1", duration_minutes: 5, escalation_owner: "Sales Manager" },
  { id: "sla-quote-followup", micro_stage: "C1.2", priority: "*", duration_minutes: 120, escalation_owner: "Sales Manager" },
  { id: "sla-finance-docs", micro_stage: "C1A.2", priority: "*", duration_minutes: 2880, escalation_owner: "Finance Manager" },
  { id: "sla-booking-stuck", micro_stage: "C2.1", priority: "*", duration_minutes: 4320, escalation_owner: "Branch Head" },
] as const;

export interface SlaEngineState {
  opportunity_id: string;
  policy_id: string;
  due_at: string;
  status: "On Track" | "At Risk" | "Breached";
  breached_at: string | null;
}

export const SLA_ENGINE_ID = "sla-engine" as const;
