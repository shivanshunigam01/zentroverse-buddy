import { create } from "zustand";
import type { CrmDashboardStats, CrmLead360, CrmLeadRow, PaginatedMeta } from "@/api/crm.api";

export type CrmLeadFilters = {
  search: string;
  stage: string;
  owner: string;
  source: string;
  status: string;
  qualification_status: string;
  duplicate_status: string;
  score_classification: string;
  temperature: string;
  followup_status: string;
  date_from: string;
  date_to: string;
  sort: string;
  order: "asc" | "desc";
};

const defaultFilters: CrmLeadFilters = {
  search: "",
  stage: "",
  owner: "",
  source: "",
  status: "",
  qualification_status: "",
  duplicate_status: "",
  score_classification: "",
  temperature: "",
  followup_status: "",
  date_from: "",
  date_to: "",
  sort: "created_at",
  order: "desc",
};

type CrmStore = {
  filters: CrmLeadFilters;
  page: number;
  pageSize: number;
  leads: CrmLeadRow[];
  leadsMeta: PaginatedMeta | null;
  dashboard: CrmDashboardStats | null;
  selectedLeadId: string | null;
  lead360: CrmLead360 | null;
  loading: boolean;
  error: string | null;
  setFilters: (patch: Partial<CrmLeadFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setSelectedLeadId: (id: string | null) => void;
  setLeads: (items: CrmLeadRow[], meta: PaginatedMeta) => void;
  setDashboard: (stats: CrmDashboardStats) => void;
  setLead360: (payload: CrmLead360 | null) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
};

export const useCrmStore = create<CrmStore>((set) => ({
  filters: { ...defaultFilters },
  page: 1,
  pageSize: 20,
  leads: [],
  leadsMeta: null,
  dashboard: null,
  selectedLeadId: null,
  lead360: null,
  loading: false,
  error: null,
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch }, page: 1 })),
  clearFilters: () => set({ filters: { ...defaultFilters }, page: 1 }),
  setPage: (page) => set({ page }),
  setSelectedLeadId: (id) => set({ selectedLeadId: id, lead360: null }),
  setLeads: (items, meta) => set({ leads: items, leadsMeta: meta }),
  setDashboard: (stats) => set({ dashboard: stats }),
  setLead360: (payload) => set({ lead360: payload }),
  setLoading: (v) => set({ loading: v }),
  setError: (msg) => set({ error: msg }),
}));
