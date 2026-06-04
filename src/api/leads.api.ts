import { api, apiBlob } from "@/lib/api";
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

function isValidIndianMobile(mobile: string): boolean {
  const n = mobile.replace(/\D/g, "").slice(-10);
  return n.length === 10 && /^[6-9]/.test(n);
}

export function toApiRows(rows: ExcelLeadRow[]): ApiImportRow[] {
  return rows
    .filter((r) => isValidIndianMobile(r.mobile.trim()))
    .map((r) => {
      const mobile = r.mobile.trim();
      const digits = mobile.replace(/\D/g, "").slice(-10);
      return {
      customerName: r.customerName.trim() || `Lead ${digits}`,
      mobile,
      product: r.product.trim() || "General",
      requirement: r.remarks?.trim() || r.leadType?.trim() || "",
      district: r.district?.trim(),
      source: r.source?.trim() || "Excel Upload",
      branch: r.branch?.trim(),
      executive: r.executive?.trim(),
      leadId: r.leadId,
      customerId: r.customerId,
      opportunityId: r.opportunityId,
    };
    });
}

export type ValidateImportResult = {
  total: number;
  valid: number;
  duplicate: number;
  invalid: number;
  outOfTerritory: number;
  rows: Array<ApiImportRow & { valid: boolean; duplicate?: boolean; errors?: string[] }>;
};

function importFileFormData(file: File, importedBy?: string): FormData {
  const fd = new FormData();
  fd.append("file", file);
  if (importedBy) fd.append("imported_by", importedBy);
  return fd;
}

/** Upload .xlsx directly — best for large files (e.g. 900+ rows). */
export async function validateImportFile(file: File): Promise<ValidateImportResult> {
  return api<ValidateImportResult>("/leads/import/validate", {
    method: "POST",
    body: importFileFormData(file),
  });
}

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

export async function commitImportFile(file: File, importedBy: string) {
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
    body: importFileFormData(file, importedBy),
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
