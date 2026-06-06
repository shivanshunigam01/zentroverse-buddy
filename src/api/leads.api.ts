import { api, apiBlob } from "@/lib/api";
import { isValidMobile, normalizeMobile } from "@/lib/mobile";
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
  return rows
    .filter((r) => isValidMobile(r.mobile))
    .map((r) => {
      const mobile = normalizeMobile(r.mobile);
      return {
      customerName: String(r.customerName ?? "").trim() || `Lead ${mobile}`,
      mobile,
      product: String(r.product ?? "").trim() || "General",
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
    timeoutMs: 600000,
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
    timeoutMs: 600000,
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

export type BulkWhatsAppResult = {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ destination: string; error: string }>;
  hasMore?: boolean;
  page?: number;
  pageSize?: number;
};

export type BulkWhatsAppCount = {
  totalCustomers: number;
  uniqueContacts: number;
};

export async function getBulkWhatsAppCount(): Promise<BulkWhatsAppCount> {
  return api<BulkWhatsAppCount>("/leads/bulk-whatsapp/count");
}

export async function sendBulkWhatsApp(mobiles: string[]): Promise<BulkWhatsAppResult> {
  return api<BulkWhatsAppResult>("/leads/bulk-whatsapp", {
    method: "POST",
    json: { mobiles },
    timeoutMs: 900000,
  });
}

/** Page through all customers in MongoDB (not limited to inbox bootstrap cap). */
export async function sendBulkWhatsAppAll(page: number, pageSize = 100): Promise<BulkWhatsAppResult> {
  return api<BulkWhatsAppResult>("/leads/bulk-whatsapp", {
    method: "POST",
    json: { all: true, page, pageSize },
    timeoutMs: 900000,
  });
}

export type WhatsAppCampaignContact = {
  id: string;
  mobile: string;
  userNumber: string;
  userName: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  repliedAt: string | null;
  failedAt: string | null;
  error: string | null;
  status: string;
};

export type WhatsAppCampaignReport = {
  campaign: { id: string; name: string; status: string; type: string };
  summary: {
    total: number;
    sent: number;
    delivered: number;
    readNoReply: number;
    replied: number;
    failed: number;
    pendingDelivery: number;
  };
  contacts: {
    sent: WhatsAppCampaignContact[];
    delivered: WhatsAppCampaignContact[];
    read_no_reply: WhatsAppCampaignContact[];
    replied: WhatsAppCampaignContact[];
    failed: WhatsAppCampaignContact[];
  };
  fetchedAt: string;
};

export async function getBulkWhatsAppReport(campaignName?: string): Promise<WhatsAppCampaignReport> {
  const qs = campaignName ? `?campaignName=${encodeURIComponent(campaignName)}` : "";
  return api<WhatsAppCampaignReport>(`/leads/bulk-whatsapp/report${qs}`, {
    timeoutMs: 120000,
  });
}
