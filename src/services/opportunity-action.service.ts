import { toast } from "sonner";
import type { AppModuleId } from "@/domain/app-nav";
import { eventBus, createCorrelationId } from "@/domain/events/event-bus";
import type { MacroStageId, MicroStageCode } from "@/domain/stages/types";
import { getMicroStagesForMacro } from "@/domain/stages/business-stages";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import { ACTION_REGISTRY, parseMicroStageFromInput, type ActionEffect } from "@/domain/actions/action-registry";
import { getZentroFlowStore } from "@/store/opportunity-store";
import { scoringService } from "@/services/scoring.service";
import { contactHealthService } from "@/services/contact-health.service";
import { validateSingleOwner } from "@/services/ownership.service";

export type PerformActionOptions = {
  opportunityId?: string;
  macroId?: MacroStageId;
  stageIndex?: number;
  manualMicroStage?: MicroStageCode;
  owner?: string;
  currentAction?: string;
  nextAction?: string;
  reason?: string;
  navigateTo?: AppModuleId;
};

function resolveOpportunity(id?: string, macroId?: MacroStageId): OpportunityMaster | undefined {
  const store = getZentroFlowStore();
  if (id) return store.getOpportunity(id);
  if (macroId) {
    const stageByMacro: Record<MacroStageId, string> = {
      c0: "C0", c1: "C1", c1a: "C1A", c2: "C2", c3: "C3", lifecycle: "lifecycle",
    };
    const target = stageByMacro[macroId];
    return store.listOpportunities().find((o) =>
      macroId === "lifecycle" ? o.lifecycle_stage != null : o.current_stage === target,
    );
  }
  return store.listOpportunities()[0];
}

export async function performOpportunityAction(
  label: string,
  options: PerformActionOptions,
  navigate: (module: AppModuleId) => void,
): Promise<void> {
  const effect: ActionEffect = ACTION_REGISTRY[label] ?? { description: label };
  const store = getZentroFlowStore();
  const opp = resolveOpportunity(options.opportunityId, options.macroId);

  const microStage =
    options.manualMicroStage ??
    effect.microStage ??
    (options.macroId != null && options.stageIndex != null
      ? (getMicroStagesForMacro(options.macroId)[options.stageIndex]?.code as MicroStageCode | undefined)
      : undefined);

  if (opp && microStage) {
    try {
      if (options.owner) validateSingleOwner(options.owner);
      await store.moveStage(opp.opportunity_id, microStage, "Current User", options.reason ?? label, true);
      const updated = store.getOpportunity(opp.opportunity_id);
      if (updated) {
        store.upsertOpportunity({
          ...updated,
          ...(options.owner ? { current_owner: options.owner } : {}),
          ...(options.currentAction
            ? { current_action: options.currentAction, next_action: options.nextAction ?? options.currentAction }
            : {}),
          ...(effect.status ? { status: effect.status } : {}),
        });
      }
    } catch (err) {
      toast.error("Cannot move stage", {
        description: err instanceof Error ? err.message : "Stage transition failed",
      });
      return;
    }
  } else if (opp && effect.status) {
    store.upsertOpportunity({ ...opp, status: effect.status });
  }

  if (opp && effect.scoreEvent) {
    try {
      const current = store.getOpportunity(opp.opportunity_id)!;
      const { opportunity } = scoringService.applyScoreEvent(current, effect.scoreEvent);
      store.upsertOpportunity(opportunity);
    } catch {
      /* unknown score event — skip */
    }
  }

  if (opp && label === "Verify Number") {
    const customer = store.getCustomer(opp.customer_id);
    if (customer) {
      const health = contactHealthService.runContactHealthEngine({
        opportunity: store.getOpportunity(opp.opportunity_id)!,
        mobile: customer.mobile,
        district: customer.address ?? "",
        branch_territory: opp.branch,
        sibling_opportunities: store.getOpportunitiesByCustomer(opp.customer_id),
      });
      store.setContactHealth(health);
    }
  }

  if (opp && effect.eventType) {
    await eventBus.publish({
      type: effect.eventType,
      opportunity_id: opp.opportunity_id,
      customer_id: opp.customer_id,
      payload: { action: label },
      occurred_at: new Date().toISOString(),
      correlation_id: createCorrelationId(),
    });
  }

  toast.success(label, {
    description:
      effect.description ??
      (opp && microStage ? `${opp.opportunity_id} → ${microStage}` : "Queued for backend sync"),
  });

  if (options.navigateTo ?? effect.navigateTo) {
    setTimeout(() => navigate(options.navigateTo ?? effect.navigateTo!), 350);
  }
}

export async function confirmManualStageMove(
  opportunityId: string,
  form: { newStage: string; newAction: string; owner: string; reason?: string },
  navigate: (module: AppModuleId) => void,
): Promise<boolean> {
  const micro = parseMicroStageFromInput(form.newStage);
  if (!micro) {
    toast.error("Invalid stage", { description: "Use format C1A.5 or C1 · C1.3 Objection" });
    return false;
  }
  await performOpportunityAction(
    "Stage moved",
    {
      opportunityId,
      manualMicroStage: micro,
      owner: form.owner,
      currentAction: form.newAction,
      nextAction: form.newAction,
      reason: form.reason,
    },
    navigate,
  );
  return true;
}
