import { useMemo } from "react";
import type { AppModuleId } from "@/domain/app-nav";
import { ACTION_REGISTRY } from "@/domain/actions/action-registry";
import { canAccessModule, canPerformAction } from "@/domain/stages/stage-gates";
import { useOpportunityList } from "@/store/selectors";
import { useZentroFlowStore } from "@/store/opportunity-store";
import type { OpportunityMaster } from "@/domain/entities/opportunity";

export function useStageGates(selectedOpportunityId?: string) {
  const opportunities = useOpportunityList();
  const selected = useZentroFlowStore((s) =>
    selectedOpportunityId ? s.opportunities[selectedOpportunityId] : undefined,
  );

  const moduleAccess = useMemo(() => {
    const map = {} as Record<AppModuleId, { allowed: boolean; reason?: string }>;
    const modules: AppModuleId[] = [
      "dashboard", "lead-upload", "lead-inbox", "lead-detail", "action-engine",
      "autodialer", "whatsapp-bot", "sales-pipeline", "finance-desk", "booking-billing",
      "delivery-desk", "lifecycle-crm", "re-engagement", "reports", "masters",
    ];
    for (const m of modules) {
      map[m] = canAccessModule(m, opportunities);
    }
    return map;
  }, [opportunities]);

  const canRunAction = (label: string, opp?: OpportunityMaster) => {
    const target = ACTION_REGISTRY[label]?.microStage;
    const opportunity = opp ?? selected ?? opportunities[0];
    return canPerformAction(opportunity, label, target);
  };

  const hasData = opportunities.length > 0;

  return { moduleAccess, canRunAction, hasData, opportunities, selected };
}
