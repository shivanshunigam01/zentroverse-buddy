import type { PriorityCode } from "@/domain/entities/opportunity";

/** Escalation Engine — triggered by SLA breach or rule match */

export type EscalationTrigger = "SLA Breach" | "Hot Lead Stuck" | "Finance Delay" | "Manager Request";

export interface EscalationEvent {
  id: string;
  opportunity_id: string;
  trigger: EscalationTrigger;
  escalation_owner: string;
  priority: PriorityCode;
  created_at: string;
  resolved_at: string | null;
}

export const ESCALATION_ENGINE_ID = "escalation-engine" as const;
