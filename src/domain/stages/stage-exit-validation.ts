import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { MicroStageCode } from "./types";
import { getStageMaster } from "./stage-master";

export interface StageExitValidationResult {
  ok: boolean;
  missingFields: string[];
  stageCode: string;
  message?: string;
}

function fieldPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return !Number.isNaN(value);
  return Boolean(value);
}

/** Collect stage_step_data fields for a micro stage (current exit gate). */
export function getStageStepFields(
  opp: OpportunityMaster,
  stageCode: string,
): Record<string, string | number | boolean> {
  return opp.stage_step_data?.[stageCode]?.fields ?? {};
}

/**
 * Validate that the opportunity may leave `fromStage` (exit conditions / mandatory fields).
 * Used before advancing to the next micro stage (acceptance #6 / AE-T004).
 */
export function validateStageExit(
  opp: OpportunityMaster,
  fromStage: MicroStageCode | string,
): StageExitValidationResult {
  const master = getStageMaster(fromStage);
  if (!master) {
    return { ok: true, missingFields: [], stageCode: fromStage };
  }

  const fields = getStageStepFields(opp, fromStage);
  const missing = master.mandatoryFields.filter((key) => !fieldPresent(fields[key]));

  if (missing.length === 0) {
    return { ok: true, missingFields: [], stageCode: fromStage };
  }

  return {
    ok: false,
    missingFields: missing,
    stageCode: fromStage,
    message: `Cannot leave ${fromStage}: missing mandatory fields (${missing.join(", ")}). ${master.mandatoryValidation}`,
  };
}

/**
 * AE-T004 helper: block C0.10 → C1.* when quote-readiness fields incomplete.
 */
export function assertStageExitAllowsTransition(
  opp: OpportunityMaster,
  target: MicroStageCode,
  allowOverride = false,
): void {
  if (allowOverride) return;
  const result = validateStageExit(opp, opp.current_micro_stage);
  if (!result.ok) {
    throw new Error(result.message ?? `Exit validation failed for ${opp.current_micro_stage}`);
  }
  // Target unused today — exit gate is on current stage; kept for future entry checks
  void target;
}
