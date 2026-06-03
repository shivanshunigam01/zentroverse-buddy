import { useCallback } from "react";
import type { MacroStageId } from "@/domain/stages/types";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import type { PerformActionOptions } from "@/services/opportunity-action.service";

export function useOpportunityActions(defaultOpportunityId?: string) {
  const { performAction } = useDashboardActions();

  const run = useCallback(
    (label: string, options?: Omit<PerformActionOptions, "opportunityId">) =>
      performAction(label, { ...options, opportunityId: defaultOpportunityId ?? options?.opportunityId }),
    [defaultOpportunityId, performAction],
  );

  const runPipeline = useCallback(
    (label: string, macroId: MacroStageId, stageIndex: number) =>
      performAction(label, { macroId, stageIndex, opportunityId: defaultOpportunityId }),
    [defaultOpportunityId, performAction],
  );

  return { run, runPipeline };
}
