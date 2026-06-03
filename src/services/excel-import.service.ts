import * as XLSX from "xlsx";
import type { CustomerMaster } from "@/domain/entities/customer";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import { classifyDuplicate } from "@/domain/duplicate/rules";
import { eventBus, createCorrelationId } from "@/domain/events/event-bus";

export type ExcelLeadRow = {
  customerName: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  district: string;
  source: string;
  campaign?: string;
  product: string;
  leadType: string;
  branch: string;
  executive: string;
  remarks?: string;
};

export type ImportRowResult =
  | { status: "imported"; customer: CustomerMaster; opportunity: OpportunityMaster }
  | { status: "duplicate"; reason: string }
  | { status: "invalid"; reason: string }
  | { status: "rejected"; reason: string };

export type ImportBatchResult = {
  total: number;
  valid: number;
  duplicate: number;
  invalid: number;
  outOfTerritory: number;
  imported: number;
  rejected: number;
  rows: ImportRowResult[];
};

const COLUMN_ALIASES: Record<keyof ExcelLeadRow, string[]> = {
  customerName: ["customer name", "name", "customer"],
  mobile: ["mobile", "phone", "mobile number"],
  alternateMobile: ["alternate mobile", "alt mobile"],
  email: ["email", "e-mail"],
  district: ["district", "city", "territory"],
  source: ["source", "lead source"],
  campaign: ["campaign"],
  product: ["product interest", "product", "model"],
  leadType: ["lead type", "type"],
  branch: ["branch"],
  executive: ["executive", "owner", "assigned to"],
  remarks: ["remarks", "notes"],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase();
}

function pick(row: Record<string, unknown>, field: keyof ExcelLeadRow): string {
  const keys = Object.keys(row);
  for (const alias of COLUMN_ALIASES[field]) {
    const match = keys.find((k) => normalizeHeader(k) === alias);
    if (match && row[match] != null) return String(row[match]).trim();
  }
  return "";
}

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "").slice(-10);
}

function isValidMobile(mobile: string): boolean {
  const n = normalizeMobile(mobile);
  return n.length === 10 && /^[6-9]/.test(n);
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function parseExcelFile(buffer: ArrayBuffer): ExcelLeadRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return json.map((row) => ({
    customerName: pick(row, "customerName"),
    mobile: pick(row, "mobile"),
    alternateMobile: pick(row, "alternateMobile") || undefined,
    email: pick(row, "email") || undefined,
    district: pick(row, "district"),
    source: pick(row, "source") || "Excel Upload",
    campaign: pick(row, "campaign") || undefined,
    product: pick(row, "product"),
    leadType: pick(row, "leadType") || "New",
    branch: pick(row, "branch") || "Main Branch",
    executive: pick(row, "executive") || "Sales Executive",
    remarks: pick(row, "remarks") || undefined,
  }));
}

export function buildSampleCsv(): string {
  const headers = [
    "Customer Name", "Mobile", "Alternate Mobile", "Email", "District",
    "Source", "Campaign", "Product Interest", "Lead Type", "Branch", "Executive", "Remarks",
  ];
  const sample = [
    "ABC Logistics", "9988776655", "", "ops@abc.in", "Chennai",
    "Walk-in", "Q2 Fleet", "Tata Ace", "New", "Chennai Central", "Sales Executive", "Fleet enquiry",
  ];
  return `${headers.join(",")}\n${sample.join(",")}\n`;
}

export async function importLeadRows(
  rows: ExcelLeadRow[],
  existingCustomers: CustomerMaster[],
  existingOpportunities: OpportunityMaster[],
): Promise<ImportBatchResult> {
  const result: ImportBatchResult = {
    total: rows.length,
    valid: 0,
    duplicate: 0,
    invalid: 0,
    outOfTerritory: 0,
    imported: 0,
    rejected: 0,
    rows: [],
  };

  const customersByMobile = new Map(existingCustomers.map((c) => [c.mobile_normalized, c]));
  const allOpps = [...existingOpportunities];

  for (const row of rows) {
    if (!row.customerName || !row.mobile || !row.product) {
      result.invalid++;
      result.rejected++;
      result.rows.push({ status: "invalid", reason: "Missing name, mobile, or product" });
      continue;
    }

    if (!isValidMobile(row.mobile)) {
      result.invalid++;
      result.rejected++;
      result.rows.push({ status: "invalid", reason: `Invalid mobile: ${row.mobile}` });
      continue;
    }

    result.valid++;

    const mobileNorm = normalizeMobile(row.mobile);
    let customer = customersByMobile.get(mobileNorm);
    const now = new Date().toISOString();

    if (!customer) {
      customer = {
        customer_id: id("CU"),
        name: row.customerName,
        mobile: row.mobile,
        mobile_normalized: mobileNorm,
        email: row.email ?? null,
        address: row.district || null,
        customer_type: "Individual",
        created_at: now,
        updated_at: now,
      };
      customersByMobile.set(mobileNorm, customer);
    }

    const siblingOpps = allOpps.filter((o) => o.customer_id === customer!.customer_id);
    const dupClass = classifyDuplicate({
      customer_id: customer.customer_id,
      product: row.product,
      requirement: row.remarks ?? null,
      existing_opportunities: siblingOpps.map((o) => ({
        opportunity_id: o.opportunity_id,
        product: o.product,
        requirement: o.requirement,
        status: o.status,
        last_activity_at: o.last_activity_at,
      })),
    });

    if (dupClass === "Exact Duplicate") {
      result.duplicate++;
      result.rejected++;
      result.rows.push({ status: "duplicate", reason: "Exact duplicate — same product & requirement within 30 days" });
      continue;
    }

    const nextActionDate = new Date(Date.now() + 4 * 3600000).toISOString();
    const opportunity: OpportunityMaster = {
      opportunity_id: id("OP"),
      customer_id: customer.customer_id,
      product: row.product,
      variant: null,
      requirement: row.remarks ?? null,
      opportunity_type: dupClass === "New Opportunity" ? "New" : "Cross Sell",
      current_stage: "C0",
      lifecycle_stage: null,
      current_micro_stage: "C0.1",
      current_owner: row.executive,
      current_action: "Establish contact — verify mobile & territory",
      next_action: "Complete C0.1 Contact checklist",
      next_action_date: nextActionDate,
      priority: "P3",
      lead_score: 0,
      score_classification: "Cold",
      sla: "Same day",
      sla_due_at: nextActionDate,
      sla_status: "On Track",
      escalation_owner: "Sales Manager",
      status: "Open",
      source: row.source,
      campaign: row.campaign ?? null,
      branch: row.branch,
      last_activity_at: now,
      created_at: now,
      updated_at: now,
    };

    allOpps.push(opportunity);
    result.imported++;
    result.rows.push({ status: "imported", customer, opportunity });

    await eventBus.publish({
      type: "lead.created",
      opportunity_id: opportunity.opportunity_id,
      customer_id: customer.customer_id,
      payload: { source: "excel", product: row.product },
      occurred_at: now,
      correlation_id: createCorrelationId(),
    });
  }

  return result;
}
