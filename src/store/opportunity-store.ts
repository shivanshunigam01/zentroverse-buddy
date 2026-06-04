import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerMaster } from "@/domain/entities/customer";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import type { LeadActivity } from "@/domain/entities/activity";
import type { StageHistory } from "@/domain/entities/stage-history";
import type { CommunicationLog } from "@/domain/entities/communication";
import type { ContactHealthAttributes } from "@/domain/engines/contact-health";
import type { ScoreLedgerEntry } from "@/domain/engines/scoring";
import type { OpportunityOwnership } from "@/domain/entities/ownership";
import type { ImportBatchResult } from "@/services/excel-import.service";
import * as opportunitiesApi from "@/api/opportunities.api";
import { ACTION_REGISTRY } from "@/domain/actions/action-registry";
import type { BootstrapPayload } from "@/api/bootstrap.api";

export interface ZentroFlowStore {
  customers: Record<string, CustomerMaster>;
  opportunities: Record<string, OpportunityMaster>;
  activities: LeadActivity[];
  stageHistory: StageHistory[];
  communications: CommunicationLog[];
  contactHealth: Record<string, ContactHealthAttributes>;
  scoreLedger: ScoreLedgerEntry[];
  ownership: OpportunityOwnership[];
  lastImport: ImportBatchResult | null;

  hasOpportunities: () => boolean;
  getCustomer: (id: string) => CustomerMaster | undefined;
  getOpportunity: (id: string) => OpportunityMaster | undefined;
  getOpportunitiesByCustomer: (customerId: string) => OpportunityMaster[];
  listOpportunities: () => OpportunityMaster[];
  listCustomers: () => CustomerMaster[];
  getContactHealth: (opportunityId: string) => ContactHealthAttributes | undefined;

  hydrate: (payload: BootstrapPayload) => void;
  setLastImport: (result: ImportBatchResult | null) => void;
  setActivitiesForOpportunity: (opportunityId: string, rows: LeadActivity[]) => void;

  upsertCustomer: (customer: CustomerMaster) => void;
  upsertOpportunity: (opportunity: OpportunityMaster) => void;
  appendActivity: (activity: LeadActivity) => void;
  appendStageHistory: (history: StageHistory) => void;
  setContactHealth: (attrs: ContactHealthAttributes) => void;
  appendScoreLedger: (entry: ScoreLedgerEntry) => void;
  setOwnership: (rows: OpportunityOwnership[]) => void;
  applyImportResult: (result: ImportBatchResult) => void;
  clearAll: () => void;

  moveStage: (
    opportunityId: string,
    newMicroStage: OpportunityMaster["current_micro_stage"],
    changedBy: string,
    reason?: string,
    force?: boolean,
    actionLabel?: string,
  ) => Promise<OpportunityMaster | null>;
}

const EMPTY = {
  customers: {} as Record<string, CustomerMaster>,
  opportunities: {} as Record<string, OpportunityMaster>,
  activities: [] as LeadActivity[],
  stageHistory: [] as StageHistory[],
  communications: [] as CommunicationLog[],
  contactHealth: {} as Record<string, ContactHealthAttributes>,
  scoreLedger: [] as ScoreLedgerEntry[],
  ownership: [] as OpportunityOwnership[],
  lastImport: null as ImportBatchResult | null,
};

export const useZentroFlowStore = create<ZentroFlowStore>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      hasOpportunities: () => Object.keys(get().opportunities).length > 0,
      getCustomer: (id) => get().customers[id],
      getOpportunity: (id) => get().opportunities[id],
      getOpportunitiesByCustomer: (customerId) =>
        Object.values(get().opportunities).filter((o) => o.customer_id === customerId),
      listOpportunities: () => Object.values(get().opportunities),
      listCustomers: () => Object.values(get().customers),
      getContactHealth: (opportunityId) => get().contactHealth[opportunityId],

      hydrate: (payload) =>
        set({
          customers: payload.customers,
          opportunities: payload.opportunities,
          activities: payload.activities,
          lastImport: payload.lastImport,
        }),

      setLastImport: (result) => set({ lastImport: result }),

      setActivitiesForOpportunity: (opportunityId, rows) =>
        set((s) => ({
          activities: [
            ...s.activities.filter((a) => a.opportunity_id !== opportunityId),
            ...rows,
          ],
        })),

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

      applyImportResult: (result) => {
        set((s) => {
          const customers = { ...s.customers };
          const opportunities = { ...s.opportunities };
          for (const row of result.rows) {
            if (row.status === "imported") {
              customers[row.customer.customer_id] = row.customer;
              opportunities[row.opportunity.opportunity_id] = row.opportunity;
            }
          }
          return { customers, opportunities, lastImport: result };
        });
      },

      clearAll: () => set({ ...EMPTY }),

      moveStage: async (opportunityId, newMicroStage, changedBy, reason, force, actionLabel) => {
        const opp = get().getOpportunity(opportunityId);
        if (!opp) return null;

        try {
          let updated: OpportunityMaster;
          const registryStage = actionLabel ? ACTION_REGISTRY[actionLabel]?.microStage : undefined;
          const useActionEndpoint =
            Boolean(actionLabel) &&
            registryStage === newMicroStage &&
            !force;

          if (useActionEndpoint && actionLabel) {
            updated = await opportunitiesApi.runAction(opportunityId, {
              action_label: actionLabel,
              changed_by: changedBy,
              force,
              reason,
            });
          } else {
            updated = await opportunitiesApi.stageTransition(opportunityId, {
              new_micro_stage: newMicroStage,
              changed_by: changedBy,
              force,
              reason,
            });
          }

          get().upsertOpportunity(updated);
          const activities = await opportunitiesApi.getActivities(opportunityId);
          get().setActivitiesForOpportunity(opportunityId, activities);
          return updated;
        } catch {
          throw new Error("Stage transition failed on server");
        }
      },
    }),
    {
      name: "zentroflow-live-v2",
      partialize: (s) => ({
        customers: s.customers,
        opportunities: s.opportunities,
        activities: s.activities,
        stageHistory: s.stageHistory,
        contactHealth: s.contactHealth,
        scoreLedger: s.scoreLedger,
        lastImport: s.lastImport,
      }),
    },
  ),
);

export function getZentroFlowStore(): ZentroFlowStore {
  return useZentroFlowStore.getState();
}
