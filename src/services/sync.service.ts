import { fetchBootstrap } from "@/api/bootstrap.api";
import { getActivities, getOpportunity } from "@/api/opportunities.api";
import { getCustomer } from "@/api/customers.api";
import { getZentroFlowStore } from "@/store/opportunity-store";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { ImportBatchResult } from "@/services/excel-import.service";

export { persistLeadFromApiDto } from "@/services/lead-persist.service";

export async function refreshFromApi(): Promise<void> {
  const payload = await fetchBootstrap();
  getZentroFlowStore().hydrate(payload);
}

export async function refreshOpportunity(opportunityId: string): Promise<OpportunityMaster | null> {
  const store = getZentroFlowStore();
  try {
    const [opp, activities] = await Promise.all([
      getOpportunity(opportunityId),
      getActivities(opportunityId),
    ]);
    store.upsertOpportunity(opp);
    store.setActivitiesForOpportunity(opportunityId, activities);

    const customer = await getCustomer(opp.customer_id);
    store.upsertCustomer(customer);

    return opp;
  } catch {
    return null;
  }
}

export function mapLatestImport(raw: Record<string, unknown> | null): ImportBatchResult | null {
  if (!raw) return null;
  return {
    total: Number(raw.total ?? 0),
    valid: Number(raw.valid ?? 0),
    duplicate: Number(raw.duplicate ?? 0),
    invalid: Number(raw.invalid ?? 0),
    outOfTerritory: Number(raw.outOfTerritory ?? 0),
    imported: Number(raw.imported ?? 0),
    rejected: Number(raw.rejected ?? 0),
    rows: [],
  };
}
