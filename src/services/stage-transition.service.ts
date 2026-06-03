import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { StageHistory } from "@/domain/entities/stage-history";
import type { LeadActivity } from "@/domain/entities/activity";
import { getMicroStagesForMacro } from "@/domain/stages/business-stages";
import type { MacroStageId, MicroStageCode, ReportableStage } from "@/domain/stages/types";
import { microStageToMacro, isLifecycleStage } from "@/domain/stages/types";
import { eventBus, createCorrelationId } from "@/domain/events/event-bus";
import { actionEngineService } from "./action-engine.service";
import { validateSingleOwner } from "./ownership.service";
import { validateSequentialTransition } from "@/domain/stages/stage-gates";

export interface StageTransitionRequest {
  opportunity: OpportunityMaster;
  new_micro_stage: MicroStageCode;
  changed_by: string;
  reason?: string;
  /** Skip regression validation for explicit action buttons */
  force?: boolean;
}

export interface StageTransitionResult {
  opportunity: OpportunityMaster;
  history: StageHistory;
  activity: LeadActivity;
}

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function macroIdFromCode(code: MicroStageCode): MacroStageId {
  const macro = microStageToMacro(code);
  const map: Record<string, MacroStageId> = {
    C0: "c0", C1: "c1", C1A: "c1a", C2: "c2", C3: "c3", lifecycle: "lifecycle",
  };
  return map[macro];
}

function resolveReportableStage(code: MicroStageCode): ReportableStage {
  const macro = microStageToMacro(code);
  if (macro === "lifecycle") return code as ReportableStage;
  return macro;
}

export function validateMicroStageTransition(
  current: MicroStageCode,
  next: MicroStageCode,
): void {
  const currentMacro = macroIdFromCode(current);
  const nextMacro = macroIdFromCode(next);
  const allowed = getMicroStagesForMacro(currentMacro).map((s) => s.code);
  const nextAllowed = getMicroStagesForMacro(nextMacro).map((s) => s.code);

  if (!nextAllowed.includes(next)) {
    throw new Error(`Micro stage ${next} is not valid for macro ${nextMacro}`);
  }

  const currentIdx = allowed.indexOf(current);
  const nextIdx = nextAllowed.indexOf(next);

  if (currentMacro === nextMacro && nextIdx < currentIdx - 1) {
    throw new Error(`Cannot regress from ${current} to ${next} without manager override`);
  }
}

export async function transitionStage(req: StageTransitionRequest): Promise<StageTransitionResult> {
  if (!req.force) {
    validateMicroStageTransition(req.opportunity.current_micro_stage, req.new_micro_stage);
    validateSequentialTransition(req.opportunity, req.new_micro_stage, false);
  }
  validateSingleOwner(req.opportunity.current_owner);

  const now = new Date().toISOString();
  const newReportable = resolveReportableStage(req.new_micro_stage);
  const oldReportable: ReportableStage | null = req.opportunity.lifecycle_stage
    ?? req.opportunity.current_stage;

  const updated: OpportunityMaster = {
    ...req.opportunity,
    current_micro_stage: req.new_micro_stage,
    current_stage: isLifecycleStage(newReportable) ? null : newReportable,
    lifecycle_stage: isLifecycleStage(newReportable) ? newReportable : null,
    last_activity_at: now,
    updated_at: now,
  };

  const enginePatch = actionEngineService.applyToOpportunity(updated);
  Object.assign(updated, enginePatch);

  const history: StageHistory = {
    history_id: id("sh"),
    opportunity_id: req.opportunity.opportunity_id,
    old_stage: oldReportable,
    old_micro_stage: req.opportunity.current_micro_stage,
    new_stage: newReportable,
    new_micro_stage: req.new_micro_stage,
    reason: req.reason ?? null,
    changed_by: req.changed_by,
    changed_at: now,
  };

  const activity: LeadActivity = {
    activity_id: id("act"),
    opportunity_id: req.opportunity.opportunity_id,
    activity_type: "Stage Change",
    remarks: `Stage ${req.opportunity.current_micro_stage} → ${req.new_micro_stage}${req.reason ? `: ${req.reason}` : ""}`,
    created_by: req.changed_by,
    created_at: now,
  };

  const correlationId = createCorrelationId();
  await eventBus.publish({
    type: "stage.changed",
    opportunity_id: req.opportunity.opportunity_id,
    customer_id: req.opportunity.customer_id,
    payload: { history, from: req.opportunity.current_micro_stage, to: req.new_micro_stage },
    occurred_at: now,
    correlation_id: correlationId,
  });

  return { opportunity: updated, history, activity };
}

export const stageTransitionService = { transitionStage, validateMicroStageTransition };
