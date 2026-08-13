import type { OpportunityMaster } from "./opportunity";
import { getStageMaster } from "@/domain/stages/stage-master";
import { getNextMicroStage } from "@/domain/stages/stage-gates";

export interface GoldenRuleViolation {
  field: string;
  reason: string;
}

/**
 * Spec sheet 00 — Non-negotiable Action Engine rule:
 * Every open opportunity must always have exactly one current stage, one current owner,
 * one current action, one due time and one valid next-stage path.
 */
export function checkGoldenRule(opp: OpportunityMaster): GoldenRuleViolation[] {
  if (opp.status !== "Open") return [];

  const violations: GoldenRuleViolation[] = [];

  if (!opp.current_micro_stage) {
    violations.push({ field: "current_micro_stage", reason: "Missing micro stage" });
  }
  if (!opp.current_owner?.trim()) {
    violations.push({ field: "current_owner", reason: "Missing current owner" });
  }
  if (!opp.current_action?.trim()) {
    violations.push({ field: "current_action", reason: "Missing current action" });
  }
  if (!opp.next_action?.trim()) {
    violations.push({ field: "next_action", reason: "Missing next action" });
  }
  if (!opp.next_action_date && !opp.sla_due_at) {
    violations.push({ field: "due_time", reason: "Missing due time (next_action_date or sla_due_at)" });
  }
  if (!opp.sla?.trim()) {
    violations.push({ field: "sla", reason: "Missing SLA policy label" });
  }

  const master = getStageMaster(opp.current_micro_stage);
  if (!master) {
    violations.push({
      field: "current_micro_stage",
      reason: `Unknown micro stage ${opp.current_micro_stage} — not in Stage Master`,
    });
  } else {
    const next = (master.nextStage && master.nextStage.trim()) || getNextMicroStage(opp);
    if (!next || String(next).trim() === "") {
      violations.push({ field: "next_stage_path", reason: "No valid next-stage path" });
    }
  }

  if (!opp.current_stage && !opp.lifecycle_stage) {
    violations.push({ field: "current_stage", reason: "Missing macro or lifecycle stage" });
  }

  return violations;
}

export function assertGoldenRule(opp: OpportunityMaster): void {
  const violations = checkGoldenRule(opp);
  if (violations.length > 0) {
    throw new Error(
      `Golden rule violated for ${opp.opportunity_id}: ${violations.map((v) => v.reason).join("; ")}`,
    );
  }
}

export function isGoldenRuleHealthy(opp: OpportunityMaster): boolean {
  return checkGoldenRule(opp).length === 0;
}

/** Health scan — open opportunities missing stage/owner/action/due/path */
export function findGoldenRuleExceptions(opportunities: OpportunityMaster[]): Array<{
  opportunity_id: string;
  violations: GoldenRuleViolation[];
}> {
  return opportunities
    .filter((o) => o.status === "Open")
    .map((o) => ({ opportunity_id: o.opportunity_id, violations: checkGoldenRule(o) }))
    .filter((r) => r.violations.length > 0);
}
