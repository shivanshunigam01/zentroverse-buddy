import type { AppModuleId } from "@/domain/app-nav";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import { getMicroStagesForMacro } from "@/domain/stages/business-stages";
import type { MacroStageId, MicroStageCode, SalesStage } from "@/domain/stages/types";
import { microStageToMacro } from "@/domain/stages/types";

/** Last micro stage of each macro — must be completed before entering the next */
export const MACRO_EXIT_STAGE: Record<SalesStage, MicroStageCode> = {
  C0: "C0.10",
  C1: "C1.10",
  C1A: "C1A.10",
  C2: "C2.10",
  C3: "C3.10",
};

export const SALES_MACRO_ORDER: SalesStage[] = ["C0", "C1", "C1A", "C2", "C3"];

const MODULE_REQUIRED_MACRO: Partial<Record<AppModuleId, SalesStage | "lifecycle">> = {
  "lead-inbox": "C0",
  "lead-detail": "C0",
  "action-engine": "C0",
  autodialer: "C0",
  "whatsapp-bot": "C0",
  "sales-pipeline": "C1",
  "finance-desk": "C1A",
  "booking-billing": "C2",
  "delivery-desk": "C3",
  "lifecycle-crm": "lifecycle",
  "re-engagement": "C0",
  reports: "C0",
};

function macroToId(m: SalesStage | "lifecycle"): MacroStageId {
  const map: Record<string, MacroStageId> = {
    C0: "c0", C1: "c1", C1A: "c1a", C2: "c2", C3: "c3", lifecycle: "lifecycle",
  };
  return map[m];
}

export function getMicroStageIndex(macroId: MacroStageId, code: MicroStageCode): number {
  return getMicroStagesForMacro(macroId).findIndex((s) => s.code === code);
}

export function getOpportunityMacroId(opp: OpportunityMaster): MacroStageId {
  if (opp.lifecycle_stage) return "lifecycle";
  return macroToId(opp.current_stage ?? "C0");
}

/** True when opportunity has reached or passed the exit micro stage of a macro */
export function isMacroCompleteForOpportunity(opp: OpportunityMaster, macro: SalesStage): boolean {
  const macroId = macroToId(macro);
  const stages = getMicroStagesForMacro(macroId);
  const exitIdx = getMicroStageIndex(macroId, MACRO_EXIT_STAGE[macro]);
  const currentIdx = getMicroStageIndex(macroId, opp.current_micro_stage);

  if (opp.current_stage === macro && currentIdx >= exitIdx && exitIdx >= 0) return true;

  const oppMacro = opp.current_stage;
  if (!oppMacro) return macro === "C3" && opp.lifecycle_stage != null;

  const oppOrder = SALES_MACRO_ORDER.indexOf(oppMacro);
  const requiredOrder = SALES_MACRO_ORDER.indexOf(macro);
  return oppOrder > requiredOrder;
}

export function isMacroCompleteInSystem(opportunities: OpportunityMaster[], macro: SalesStage): boolean {
  return opportunities.some((o) => isMacroCompleteForOpportunity(o, macro));
}

/** Can enter target macro from current position (sequential funnel) */
export function canEnterMacro(opp: OpportunityMaster, targetMacro: SalesStage): boolean {
  const targetIdx = SALES_MACRO_ORDER.indexOf(targetMacro);
  if (targetIdx === 0) return true;
  const prevMacro = SALES_MACRO_ORDER[targetIdx - 1];
  return isMacroCompleteForOpportunity(opp, prevMacro);
}

export function canAccessModule(
  moduleId: AppModuleId,
  opportunities: OpportunityMaster[],
): { allowed: boolean; reason?: string } {
  if (moduleId === "dashboard" || moduleId === "lead-upload" || moduleId === "masters") {
    return { allowed: true };
  }

  if (opportunities.length === 0) {
    return { allowed: false, reason: "Upload leads from Excel to begin" };
  }

  const required = MODULE_REQUIRED_MACRO[moduleId];
  if (!required) return { allowed: true };

  if (required === "lifecycle") {
    const ok = opportunities.some((o) => o.lifecycle_stage != null || o.status === "Delivered");
    return ok
      ? { allowed: true }
      : { allowed: false, reason: "Complete C3 delivery to unlock Lifecycle CRM" };
  }

  const ok = isMacroCompleteInSystem(opportunities, required) ||
    opportunities.some((o) => {
      const idx = SALES_MACRO_ORDER.indexOf(required);
      const oppIdx = o.current_stage ? SALES_MACRO_ORDER.indexOf(o.current_stage) : -1;
      return oppIdx >= idx;
    });

  if (ok) return { allowed: true };

  const prev = required === "C0" ? null : SALES_MACRO_ORDER[SALES_MACRO_ORDER.indexOf(required) - 1];
  return {
    allowed: false,
    reason: prev
      ? `Complete all ${prev} stages before opening ${required}`
      : `Import leads to unlock this module`,
  };
}

/** Strict: next step only (+1 micro) or cross-macro from exit → first of next */
export function validateSequentialTransition(
  opp: OpportunityMaster,
  target: MicroStageCode,
  allowOverride = false,
): void {
  if (allowOverride) return;

  const current = opp.current_micro_stage;
  const currentMacro = microStageToMacro(current);
  const targetMacro = microStageToMacro(target);

  const currentMacroId = getOpportunityMacroId(opp);
  const targetMacroId = macroToId(targetMacro === "lifecycle" ? "C3" : (targetMacro as SalesStage));
  const targetMacroIdResolved: MacroStageId =
    targetMacro === "lifecycle" ? "lifecycle" : macroToId(targetMacro as SalesStage);

  const currentIdx = getMicroStageIndex(currentMacroId, current);
  const targetIdx = getMicroStageIndex(targetMacroIdResolved, target);

  if (currentMacro === targetMacro) {
    if (targetIdx !== currentIdx + 1) {
      throw new Error(
        `Complete ${current} before moving to ${target}. Next step only — no skipping.`,
      );
    }
    return;
  }

  if (targetMacro !== "lifecycle" && currentMacro !== "lifecycle") {
    const exitStage = MACRO_EXIT_STAGE[currentMacro as SalesStage];
    if (current !== exitStage) {
      throw new Error(
        `Finish ${exitStage} (${currentMacro} complete) before entering ${targetMacro}.`,
      );
    }
    const firstOfNext = getMicroStagesForMacro(targetMacroIdResolved)[0]?.code;
    if (firstOfNext && target !== firstOfNext) {
      throw new Error(`Enter ${targetMacro} at ${firstOfNext} first.`);
    }
    if (!canEnterMacro(opp, targetMacro as SalesStage)) {
      throw new Error(`Previous stage funnel not complete for ${targetMacro}.`);
    }
  }
}

export function canPerformAction(
  opp: OpportunityMaster | undefined,
  label: string,
  targetMicro?: MicroStageCode,
): { allowed: boolean; reason?: string } {
  if (!opp) {
    return { allowed: false, reason: "No opportunity selected — import leads first" };
  }

  if (!targetMicro) {
    return { allowed: true };
  }

  try {
    validateSequentialTransition(opp, targetMicro, false);
    return { allowed: true };
  } catch (e) {
    return {
      allowed: false,
      reason: e instanceof Error ? e.message : "Stage not available yet",
    };
  }
}

export function getNextMicroStage(opp: OpportunityMaster): MicroStageCode | null {
  const macroId = getOpportunityMacroId(opp);
  const stages = getMicroStagesForMacro(macroId);
  const idx = getMicroStageIndex(macroId, opp.current_micro_stage);
  if (idx < 0 || idx >= stages.length - 1) {
    const macro = opp.current_stage;
    if (macro && macro !== "C3") {
      const nextMacro = SALES_MACRO_ORDER[SALES_MACRO_ORDER.indexOf(macro) + 1];
      if (nextMacro && isMacroCompleteForOpportunity(opp, macro)) {
        return getMicroStagesForMacro(macroToId(nextMacro))[0]?.code ?? null;
      }
    }
    return null;
  }
  return stages[idx + 1]?.code ?? null;
}
