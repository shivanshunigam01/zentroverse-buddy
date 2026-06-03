import { useMemo } from "react";
import { useZentroFlowStore } from "./opportunity-store";
import { opportunitiesToLeads, type Lead } from "@/adapters/lead-view.adapter";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { CustomerMaster } from "@/domain/entities/customer";
import type { LeadActivity } from "@/domain/entities/activity";

/** Stable list — never select listOpportunities() directly in useZentroFlowStore (new array every time → infinite loop). */
export function useOpportunityList(): OpportunityMaster[] {
  const opportunities = useZentroFlowStore((s) => s.opportunities);
  return useMemo(() => Object.values(opportunities), [opportunities]);
}

export function useOpportunityLeads(): Lead[] {
  const opportunities = useZentroFlowStore((s) => s.opportunities);
  const customers = useZentroFlowStore((s) => s.customers);
  return useMemo(
    () => opportunitiesToLeads(Object.values(opportunities), customers),
    [opportunities, customers],
  );
}

export function useActivitiesForOpportunity(opportunityId?: string): LeadActivity[] {
  const activities = useZentroFlowStore((s) => s.activities);
  return useMemo(
    () =>
      opportunityId
        ? activities.filter((a) => a.opportunity_id === opportunityId)
        : activities,
    [activities, opportunityId],
  );
}

export function useLeadById(opportunityId: string | undefined): Lead | undefined {
  const opp = useZentroFlowStore((s) =>
    opportunityId ? s.opportunities[opportunityId] : undefined,
  );
  const customer = useZentroFlowStore((s) =>
    opp ? s.customers[opp.customer_id] : undefined,
  );
  if (!opp || !customer) return undefined;
  return opportunitiesToLeads([opp], { [customer.customer_id]: customer })[0];
}

export function useOpportunity(opportunityId: string): OpportunityMaster | undefined {
  return useZentroFlowStore((s) => s.opportunities[opportunityId]);
}

export function useCustomer(customerId: string): CustomerMaster | undefined {
  return useZentroFlowStore((s) => s.customers[customerId]);
}
