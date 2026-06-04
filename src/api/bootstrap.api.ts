import { api } from "@/api/client";
import { mapActivity, mapCustomer, mapOpportunity } from "@/api/mappers";
import type { CustomerMaster } from "@/domain/entities/customer";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { LeadActivity } from "@/domain/entities/activity";
import type { ImportBatchResult } from "@/services/excel-import.service";
import type { OpportunityDto } from "@/api/contracts/opportunities";
import { customerFromOpportunityDto } from "@/api/mappers";

export type BootstrapPayload = {
  customers: Record<string, CustomerMaster>;
  opportunities: Record<string, OpportunityMaster>;
  activities: LeadActivity[];
  lastImport: ImportBatchResult | null;
};

export async function fetchBootstrap(): Promise<BootstrapPayload> {
  const data = await api<{
    customers: Array<Record<string, unknown>>;
    opportunities: OpportunityDto[];
    activities: Array<Record<string, unknown>>;
    lastImport: ImportBatchResult | null;
  }>("/bootstrap");

  const customers: Record<string, CustomerMaster> = {};
  for (const raw of data.customers ?? []) {
    const c = mapCustomer(raw as Record<string, unknown>);
    customers[c.customer_id] = c;
  }

  const opportunities: Record<string, OpportunityMaster> = {};
  for (const dto of data.opportunities ?? []) {
    const opp = mapOpportunity(dto);
    opportunities[opp.opportunity_id] = opp;
    const fromDto = customerFromOpportunityDto(dto);
    if (fromDto && !customers[fromDto.customer_id]) {
      customers[fromDto.customer_id] = fromDto;
    }
  }

  return {
    customers,
    opportunities,
    activities: (data.activities ?? []).map((a) => mapActivity(a as Record<string, unknown>)),
    lastImport: data.lastImport,
  };
}
