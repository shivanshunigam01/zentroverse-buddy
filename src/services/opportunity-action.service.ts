import { toast } from "sonner";
import type { AppModuleId } from "@/domain/app-nav";
import { eventBus, createCorrelationId } from "@/domain/events/event-bus";
import type { MacroStageId, MicroStageCode } from "@/domain/stages/types";
import { getMicroStagesForMacro } from "@/domain/stages/business-stages";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import { ACTION_REGISTRY, parseMicroStageFromInput, type ActionEffect } from "@/domain/actions/action-registry";
import { getCurrentUserName } from "@/api/auth.api";
import * as enginesApi from "@/api/engines.api";
import * as opportunitiesApi from "@/api/opportunities.api";
import { getZentroFlowStore } from "@/store/opportunity-store";
import * as leadsApi from "@/api/leads.api";
import { refreshFromApi, refreshOpportunity } from "@/services/sync.service";
import {
  downloadSampleFromApi,
  exportImportReportFromApi,
  exportLeadsFromApi,
  exportPipelineFromApi,
} from "@/services/export.service";
import { downloadSampleLeadTemplate } from "@/services/excel-export.service";
import { scoringService } from "@/services/scoring.service";
import { contactHealthService } from "@/services/contact-health.service";
import { validateSingleOwner } from "@/services/ownership.service";
import { canPerformAction } from "@/domain/stages/stage-gates";

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

  if (label === "Download Sample" || label === "Download Sample Format") {
    const ok = await downloadSampleFromApi();
    if (!ok) downloadSampleLeadTemplate();
    toast.success("Sample downloaded", { description: "zentroflow-lead-import-template.xlsx" });
    return;
  }

  if (label === "Export Excel") {
    const ok = await exportLeadsFromApi();
    if (!ok) {
      toast.error("Nothing to export", { description: "Import leads first" });
      return;
    }
    toast.success("Export complete", { description: "Downloaded from API" });
    if (options.navigateTo ?? effect.navigateTo) {
      setTimeout(() => navigate(options.navigateTo ?? effect.navigateTo!), 350);
    }
    return;
  }

  if (label === "Export Import Report") {
    const ok = await exportImportReportFromApi(store.lastImport);
    if (!ok) {
      toast.error("No import report", { description: "Import leads from Excel first" });
      return;
    }
    toast.success("Import report exported");
    return;
  }

  if (label === "Export Pipeline Report") {
    const ok = await exportPipelineFromApi();
    if (!ok) {
      toast.error("Nothing to export", { description: "Import leads first" });
      return;
    }
    toast.success("Pipeline report exported", { description: "Downloaded from API" });
    return;
  }

  if (label === "Import Leads" || label === "Start Automation" || label === "Save Lead") {
    await refreshFromApi().catch(() => undefined);
    toast.success(label, { description: "Synced with server" });
    if (options.navigateTo ?? effect.navigateTo) {
      setTimeout(() => navigate(options.navigateTo ?? effect.navigateTo!), 350);
    }
    return;
  }

  if (label === "Generate IDs") {
    const opp = resolveOpportunity(options.opportunityId);
    const customer = opp ? store.getCustomer(opp.customer_id) : undefined;
    if (opp && customer) {
      try {
        const rows = await leadsApi.generateImportIds([
          {
            customerName: customer.name,
            mobile: customer.mobile,
            product: opp.product,
            district: customer.address ?? opp.branch,
            source: opp.source,
            branch: opp.branch,
            executive: opp.current_owner,
            leadType: "New",
          },
        ]);
        const ids = rows[0];
        if (ids?.leadId) {
          store.upsertOpportunity({ ...opp, lead_id: ids.leadId });
        }
        toast.success("IDs generated", {
          description: ids
            ? `Lead ${ids.leadId} · CU ${ids.customerId} · OP ${ids.opportunityId}`
            : "IDs assigned via API",
        });
      } catch (err) {
        toast.error("Generate IDs failed", {
          description: err instanceof Error ? err.message : "API error",
        });
      }
      return;
    }
    toast.info("Generate IDs", {
      description: "Load Excel rows first, then click Generate IDs before Import Leads",
    });
    return;
  }

  const opp = resolveOpportunity(options.opportunityId, options.macroId);

  const microStage =
    options.manualMicroStage ??
    effect.microStage ??
    (options.macroId != null && options.stageIndex != null
      ? (getMicroStagesForMacro(options.macroId)[options.stageIndex]?.code as MicroStageCode | undefined)
      : undefined);

  if (opp && microStage) {
    const gate = canPerformAction(opp, label, microStage);
    if (!gate.allowed) {
      toast.error("Action blocked", { description: gate.reason });
      return;
    }
    try {
      if (options.owner) validateSingleOwner(options.owner);
      const isManualOverride = Boolean(options.reason && options.manualMicroStage);
      await store.moveStage(
        opp.opportunity_id,
        microStage,
        getCurrentUserName(),
        options.reason ?? label,
        isManualOverride,
        label,
      );
      if (options.owner || options.currentAction) {
        try {
          const patched = await opportunitiesApi.patchOpportunity(opp.opportunity_id, {
            ...(options.owner ? { current_owner: options.owner } : {}),
            ...(options.currentAction
              ? {
                  current_action: options.currentAction,
                  next_action: options.nextAction ?? options.currentAction,
                }
              : {}),
          });
          store.upsertOpportunity(patched);
        } catch {
          const updated = store.getOpportunity(opp.opportunity_id);
          if (updated) {
            store.upsertOpportunity({
              ...updated,
              ...(options.owner ? { current_owner: options.owner } : {}),
              ...(options.currentAction
                ? { current_action: options.currentAction, next_action: options.nextAction ?? options.currentAction }
                : {}),
            });
          }
        }
      }
    } catch (err) {
      toast.error("Cannot move stage", {
        description: err instanceof Error ? err.message : "Stage transition failed",
      });
      return;
    }
  } else if (opp && effect.status && ACTION_REGISTRY[label]) {
    try {
      const updated = await opportunitiesApi.runAction(opp.opportunity_id, {
        action_label: label,
        changed_by: getCurrentUserName(),
      });
      store.upsertOpportunity(updated);
    } catch {
      store.upsertOpportunity({ ...opp, status: effect.status });
    }
  }

  if (opp && effect.scoreEvent) {
    try {
      const updated = await enginesApi.applyScore({
        opportunity_id: opp.opportunity_id,
        event: effect.scoreEvent,
      });
      store.upsertOpportunity(updated);
    } catch {
      try {
        const current = store.getOpportunity(opp.opportunity_id)!;
        const { opportunity } = scoringService.applyScoreEvent(current, effect.scoreEvent);
        store.upsertOpportunity(opportunity);
      } catch {
        /* skip */
      }
    }
  }

  if (opp && label === "Verify Number") {
    const customer = store.getCustomer(opp.customer_id);
    if (customer) {
      try {
        await enginesApi.verifyContact({
          opportunity_id: opp.opportunity_id,
          mobile: customer.mobile,
          district: customer.address ?? opp.branch,
        });
      } catch {
        /* API unavailable — fall back to local engine */
      }
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

  if (opp && (microStage || effect.status)) {
    await refreshOpportunity(opp.opportunity_id).catch(() => undefined);
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
  const store = getZentroFlowStore();
  try {
    await store.moveStage(
      opportunityId,
      micro,
      getCurrentUserName(),
      form.reason ?? "Manual stage override",
      true,
    );
    if (form.owner || form.newAction) {
      try {
        const patched = await opportunitiesApi.patchOpportunity(opportunityId, {
          current_owner: form.owner,
          current_action: form.newAction,
          next_action: form.newAction,
        });
        store.upsertOpportunity(patched);
      } catch {
        const updated = store.getOpportunity(opportunityId);
        if (updated) {
          store.upsertOpportunity({
            ...updated,
            current_owner: form.owner,
            current_action: form.newAction,
            next_action: form.newAction,
          });
        }
      }
    }
    await refreshOpportunity(opportunityId).catch(() => undefined);
    toast.success("Stage updated", { description: `${opportunityId} → ${micro}` });
  } catch (err) {
    toast.error("Cannot move stage", {
      description: err instanceof Error ? err.message : "Stage transition failed",
    });
    return false;
  }
  return true;
}
