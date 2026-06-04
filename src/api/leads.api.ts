import { api, apiBlob } from "@/api/client";
import type { ExcelLeadRow } from "@/services/excel-import.service";

export type ApiImportRow = {
  customerName: string;
  mobile: string;
  product: string;
  requirement?: string;
  district?: string;
  source?: string;
  branch?: string;
  executive?: string;
  leadId?: string;
  customerId?: string;
  opportunityId?: string;
};

export function toApiRows(rows: ExcelLeadRow[]): ApiImportRow[] {
  return rows.map((r) => ({
    customerName: r.customerName,
    mobile: r.mobile,
    product: r.product,
    requirement: r.leadType || r.remarks || "Standard",
    district: r.district,
    source: r.source,
    branch: r.branch,
    executive: r.executive,
    leadId: r.leadId,
    customerId: r.customerId,
    opportunityId: r.opportunityId,
  }));
}

export type ValidateImportResult = {
  total: number;
  valid: number;
  duplicate: number;
  invalid: number;
  outOfTerritory: number;
  rows: Array<ApiImportRow & { valid: boolean; duplicate?: boolean; errors?: string[] }>;
};

export async function validateImport(rows: ExcelLeadRow[]): Promise<ValidateImportResult> {
  return api<ValidateImportResult>("/leads/import/validate", {
    method: "POST",
    json: { rows: toApiRows(rows) },
  });
}

export async function generateImportIds(rows: ExcelLeadRow[]): Promise<ApiImportRow[]> {
  return api<ApiImportRow[]>("/leads/import/generate-ids", {
    method: "POST",
    json: { rows: toApiRows(rows) },
  });
}

export async function commitImport(rows: ExcelLeadRow[], importedBy: string) {
  return api<{
    total: number;
    valid: number;
    duplicate: number;
    invalid: number;
    imported: number;
    rejected: number;
    rows: unknown[];
  }>("/leads/import", {
    method: "POST",
    json: { rows: toApiRows(rows), imported_by: importedBy },
  });
}

export async function getLatestImport() {
  return api<Record<string, unknown> | null>("/leads/import/latest");
}

export async function downloadImportTemplate(): Promise<Blob> {
  return apiBlob("/leads/import/template");
}
