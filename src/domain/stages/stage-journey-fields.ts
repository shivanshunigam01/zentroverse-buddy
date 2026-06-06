import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { StageFieldDef } from "@/domain/stages/c0-stage-fields";
import {
  C0_STAGE_CHECKLIST,
  C0_STAGE_PURPOSE,
  formatFieldValue,
  getC0StageFields,
  getC0StagePrefill,
  isC0Stage,
} from "@/domain/stages/c0-stage-fields";
import {
  C1_STAGE_PURPOSE,
  C1A_STAGE_PURPOSE,
  C2_STAGE_PURPOSE,
  C3_STAGE_PURPOSE,
  getPipelineStageChecklist,
  getPipelineStageFields,
  isPipelineStage,
} from "@/domain/stages/pipeline-stage-fields";

export type { StageFieldDef, StageFieldOption, StageFieldType } from "@/domain/stages/c0-stage-fields";
export {
  C0_STAGE_PURPOSE,
  C1_STAGE_PURPOSE,
  C1A_STAGE_PURPOSE,
  C2_STAGE_PURPOSE,
  C3_STAGE_PURPOSE,
};

export function hasStructuredStageFields(code: string): boolean {
  return isC0Stage(code) || isPipelineStage(code);
}

export function getStageFields(code: string): StageFieldDef[] {
  if (isC0Stage(code)) return getC0StageFields(code);
  if (isPipelineStage(code)) return getPipelineStageFields(code);
  return [];
}

export function getStageChecklist(code: string): readonly string[] | undefined {
  if (isC0Stage(code)) return C0_STAGE_CHECKLIST[code];
  if (isPipelineStage(code)) return getPipelineStageChecklist(code);
  return undefined;
}

export function getStagePrefill(
  code: string,
  lead: Parameters<typeof getC0StagePrefill>[1],
  opportunity?: OpportunityMaster,
): Record<string, string> {
  if (isC0Stage(code)) {
    return getC0StagePrefill(code, lead, opportunity);
  }
  if (code === "C1A.8" || code === "C2.3") {
    return { variant_locked: opportunity?.variant ?? "" };
  }
  return {};
}

export function buildStatusGridFromStep(
  code: string,
  rawFields?: Record<string, string | number | boolean>,
): [string, string][] {
  const defs = getStageFields(code);
  if (!defs.length || !rawFields) return [];

  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawFields)) {
    fields[k] = v === undefined || v === null ? "" : String(v);
  }

  return defs
    .filter((d) => !d.readOnly)
    .map((d) => [d.label, formatFieldValue(d, fields[d.key])]);
}
