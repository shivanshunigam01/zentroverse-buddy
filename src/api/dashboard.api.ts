import { api } from "@/lib/api";

export type DashboardStats = {
  totalCustomers: number;
  totalLeads: number;
  hot: number;
  slaMissed: number;
  byStage: Array<{ _id: string | null; count: number }>;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return api<DashboardStats>("/dashboard/stats");
}
