import { create } from "zustand";
import type { CustomerMaster } from "@/domain/entities/customer";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { LeadActivity } from "@/domain/entities/activity";
import type { StageHistory } from "@/domain/entities/stage-history";
import type { CommunicationLog } from "@/domain/entities/communication";
import type { ContactHealthAttributes } from "@/domain/engines/contact-health";
import type { ScoreLedgerEntry } from "@/domain/engines/scoring";
import type { OpportunityOwnership } from "@/domain/entities/ownership";
import { SEED_CUSTOMERS, SEED_OPPORTUNITIES } from "@/store/seed-data";
import { transitionStage } from "@/services/stage-transition.service";

export interface ZentroFlowStore {
  customers: Record<string, CustomerMaster>;
  opportunities: Record<string, OpportunityMaster>;
  activities: LeadActivity[];
  stageHistory: StageHistory[];
  communications: CommunicationLog[];
  contactHealth: Record<string, ContactHealthAttributes>;
  scoreLedger: ScoreLedgerEntry[];
  ownership: OpportunityOwnership[];

  getCustomer: (id: string) => CustomerMaster | undefined;
  getOpportunity: (id: string) => OpportunityMaster | undefined;
  getOpportunitiesByCustomer: (customerId: string) => OpportunityMaster[];
  listOpportunities: () => OpportunityMaster[];
  getContactHealth: (opportunityId: string) => ContactHealthAttributes | undefined;

  upsertCustomer: (customer: CustomerMaster) => void;
  upsertOpportunity: (opportunity: OpportunityMaster) => void;
  appendActivity: (activity: LeadActivity) => void;
  appendStageHistory: (history: StageHistory) => void;
  setContactHealth: (attrs: ContactHealthAttributes) => void;
  appendScoreLedger: (entry: ScoreLedgerEntry) => void;
  setOwnership: (rows: OpportunityOwnership[]) => void;

  moveStage: (
    opportunityId: string,
    newMicroStage: OpportunityMaster["current_micro_stage"],
    changedBy: string,
    reason?: string,
  ) => Promise<OpportunityMaster | null>;
}

export const useZentroFlowStore = create<ZentroFlowStore>((set, get) => ({
  customers: Object.fromEntries(SEED_CUSTOMERS.map((c) => [c.customer_id, c])),
  opportunities: Object.fromEntries(SEED_OPPORTUNITIES.map((o) => [o.opportunity_id, o])),
  activities: [],
  stageHistory: [],
  communications: [],
  contactHealth: {},
  scoreLedger: [],
  ownership: [],

  getCustomer: (id) => get().customers[id],
  getOpportunity: (id) => get().opportunities[id],
  getOpportunitiesByCustomer: (customerId) =>
    Object.values(get().opportunities).filter((o) => o.customer_id === customerId),
  listOpportunities: () => Object.values(get().opportunities),
  getContactHealth: (opportunityId) => get().contactHealth[opportunityId],

  upsertCustomer: (customer) =>
    set((s) => ({ customers: { ...s.customers, [customer.customer_id]: customer } })),

  upsertOpportunity: (opportunity) =>
    set((s) => ({
      opportunities: { ...s.opportunities, [opportunity.opportunity_id]: opportunity },
    })),

  appendActivity: (activity) => set((s) => ({ activities: [...s.activities, activity] })),

  appendStageHistory: (history) => set((s) => ({ stageHistory: [...s.stageHistory, history] })),

  setContactHealth: (attrs) =>
    set((s) => ({ contactHealth: { ...s.contactHealth, [attrs.opportunity_id]: attrs } })),

  appendScoreLedger: (entry) => set((s) => ({ scoreLedger: [...s.scoreLedger, entry] })),

  setOwnership: (rows) => set({ ownership: rows }),

  moveStage: async (opportunityId, newMicroStage, changedBy, reason) => {
    const opp = get().getOpportunity(opportunityId);
    if (!opp) return null;
    const result = await transitionStage({
      opportunity: opp,
      new_micro_stage: newMicroStage,
      changed_by: changedBy,
      reason,
    });
    get().upsertOpportunity(result.opportunity);
    get().appendStageHistory(result.history);
    get().appendActivity(result.activity);
    return result.opportunity;
  },
}));

/** Non-React access for services */
export function getZentroFlowStore(): ZentroFlowStore {
  return useZentroFlowStore.getState();
}
