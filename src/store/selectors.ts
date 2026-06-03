import { useZentroFlowStore } from "./opportunity-store";
import { opportunitiesToLeads, type Lead } from "@/adapters/lead-view.adapter";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { CustomerMaster } from "@/domain/entities/customer";

export function useOpportunityLeads(): Lead[] {
  const opportunities = useZentroFlowStore((s) => s.opportunities);
  const customers = useZentroFlowStore((s) => s.customers);
  return opportunitiesToLeads(Object.values(opportunities), customers);
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
