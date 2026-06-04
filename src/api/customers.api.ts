import { api } from "@/lib/api";
import { mapCustomer } from "@/api/mappers";
import type { CustomerMaster } from "@/domain/entities/customer";

export async function listCustomers(limit = 500): Promise<CustomerMaster[]> {
  const rows = await api<Array<Record<string, unknown>>>(`/customers?limit=${limit}`);
  return rows.map((r) => mapCustomer(r));
}

export async function getCustomer(customerId: string): Promise<CustomerMaster & { opportunities_count?: number }> {
  const row = await api<Record<string, unknown>>(`/customers/${customerId}`);
  return { ...mapCustomer(row), opportunities_count: Number(row.opportunities_count ?? 0) };
}
