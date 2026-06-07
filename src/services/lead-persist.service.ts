import { mapOpportunity, customerFromOpportunityDto } from "@/api/mappers";
import type { OpportunityDto } from "@/api/contracts/opportunities";
import { getZentroFlowStore } from "@/store/opportunity-store";
import type { OpportunityMaster } from "@/domain/entities/opportunity";

/** Upsert opportunity + customer in local store from an API lead DTO (inbox stays in sync). */
export function persistLeadFromApiDto(raw: Record<string, unknown>): OpportunityMaster {
  const store = getZentroFlowStore();
  const opp = mapOpportunity(raw);
  store.upsertOpportunity(opp);

  const fromDto = customerFromOpportunityDto(raw as OpportunityDto);
  if (fromDto) {
    const existing = store.getCustomer(opp.customer_id);
    store.upsertCustomer({
      ...existing,
      ...fromDto,
      email: fromDto.email ?? existing?.email ?? null,
      address: fromDto.address ?? existing?.address ?? null,
      customer_type: existing?.customer_type ?? fromDto.customer_type,
      created_at: existing?.created_at ?? fromDto.created_at,
    });
  }

  return opp;
}
