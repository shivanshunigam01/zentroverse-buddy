import type { ScoreClassification } from "@/domain/engines/scoring";
import type { SalesStage, LifecycleStage, MicroStageCode } from "@/domain/stages/types";

export type OpportunityType =
  | "New"
  | "Cross Sell"
  | "Upgrade"
  | "Exchange"
  | "Fleet Expansion"
  | "Existing Customer"
  | "Reopened";

export type OpportunityStatus = "Open" | "Hold" | "Lost" | "Delivered" | "Closed";

export type PriorityCode = "P1" | "P2" | "P3" | "P4" | "P5";

/**
 * opportunity_master — child of customer; backbone fields are mandatory on every row.
 * Engines (scoring, contact health, SLA, action) write parallel attributes — never replace stage.
 */
export interface OpportunityMaster {
  opportunity_id: string;
  /** Display lead reference — {PREFIX}-LD-{seq} */
  lead_id: string;
  customer_id: string;
  product: string;
  variant: string | null;
  requirement: string | null;
  opportunity_type: OpportunityType;
  /** Reportable sales stage C0–C3; null when in lifecycle L1–L7 */
  current_stage: SalesStage | null;
  /** Lifecycle stage after C3 delivery */
  lifecycle_stage: LifecycleStage | null;
  current_micro_stage: MicroStageCode;
  /** Single accountable owner — never a role bucket */
  current_owner: string;
  current_action: string;
  next_action: string;
  next_action_date: string;
  priority: PriorityCode;
  lead_score: number;
  score_classification: ScoreClassification;
  sla: string;
  sla_due_at: string | null;
  sla_status: "On Track" | "At Risk" | "Breached";
  escalation_owner: string;
  status: OpportunityStatus;
  source: string;
  campaign: string | null;
  branch: string;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

/** Mandatory backbone — enforced at service layer before persist */
export const OPPORTUNITY_BACKBONE_KEYS = [
  "current_stage",
  "current_micro_stage",
  "current_owner",
  "current_action",
  "next_action",
  "next_action_date",
  "priority",
  "lead_score",
  "sla",
  "escalation_owner",
] as const satisfies readonly (keyof OpportunityMaster)[];

export type OpportunityBackbone = Pick<
  OpportunityMaster,
  (typeof OPPORTUNITY_BACKBONE_KEYS)[number]
>;

export function assertOpportunityBackbone(opp: Partial<OpportunityMaster>): opp is OpportunityMaster {
  return OPPORTUNITY_BACKBONE_KEYS.every((key) => {
    const v = opp[key];
    return v !== null && v !== undefined && v !== "";
  });
}
