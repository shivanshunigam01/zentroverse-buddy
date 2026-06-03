/**
 * Lead view facade — UI reads opportunity_master via adapter.
 */

export type { Lead } from "@/adapters/lead-view.adapter";
export { opportunityToLead, opportunitiesToLeads } from "@/adapters/lead-view.adapter";

import { opportunitiesToLeads, type Lead } from "@/adapters/lead-view.adapter";
import { getZentroFlowStore } from "@/store/opportunity-store";

/** Sync read for non-React code paths */
export function getLeadsSnapshot(): Lead[] {
  const store = getZentroFlowStore();
  return opportunitiesToLeads(store.listOpportunities(), store.customers);
}

export function getLeadById(opportunityId: string): Lead | undefined {
  const store = getZentroFlowStore();
  const opp = store.getOpportunity(opportunityId);
  const customer = opp ? store.getCustomer(opp.customer_id) : undefined;
  if (!opp || !customer) return undefined;
  return opportunitiesToLeads([opp], { [customer.customer_id]: customer })[0];
}
