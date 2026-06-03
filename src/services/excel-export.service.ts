import * as XLSX from "xlsx";
import type { Lead } from "@/adapters/lead-view.adapter";
import type { ImportBatchResult } from "@/services/excel-import.service";

export const LEAD_IMPORT_HEADERS = [
  "Customer Name",
  "Mobile",
  "Alternate Mobile",
  "Email",
  "District",
  "Source",
  "Campaign",
  "Product Interest",
  "Lead Type",
  "Branch",
  "Executive",
  "Remarks",
] as const;

const SAMPLE_ROWS: string[][] = [
  [
    "ABC Logistics",
    "9988776655",
    "",
    "ops@abc.in",
    "Chennai",
    "Walk-in",
    "Q2 Fleet",
    "Tata Ace",
    "New",
    "Chennai Central",
    "Sales Executive",
    "Fleet enquiry",
  ],
  [
    "Metro Transport",
    "9123456780",
    "9123456781",
    "contact@metro.in",
    "Mumbai",
    "Meta Ads",
    "Summer Campaign",
    "Tata 407",
    "New",
    "Mumbai West",
    "Meera K.",
    "Urgent fleet replacement",
  ],
  [
    "Ravi Traders",
    "9876512340",
    "",
    "",
    "Delhi",
    "Google",
    "",
    "Ace EV",
    "Cross Sell",
    "Delhi NCR",
    "Anil S.",
    "",
  ],
];

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename);
}

function autoColWidths(rows: unknown[][]): XLSX.ColInfo[] {
  const widths = rows[0]?.map((_, colIdx) => {
    const maxLen = rows.reduce((max, row) => {
      const cell = row[colIdx];
      const len = cell != null ? String(cell).length : 0;
      return Math.max(max, len);
    }, 10);
    return { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
  });
  return widths ?? [];
}

/** Sample import template — .xlsx with example rows + instructions sheet */
export function buildSampleLeadWorkbook(): XLSX.WorkBook {
  const leadSheet = XLSX.utils.aoa_to_sheet([LEAD_IMPORT_HEADERS, ...SAMPLE_ROWS]);
  leadSheet["!cols"] = autoColWidths([LEAD_IMPORT_HEADERS, ...SAMPLE_ROWS]);

  const instructions = XLSX.utils.aoa_to_sheet([
    ["ZentroFlow — Lead Import Template"],
    [""],
    ["Required fields", "Customer Name · Mobile · Product Interest"],
    ["Import behaviour", "Each row → customer + opportunity at C0.1 Contact"],
    ["Mobile format", "10-digit Indian mobile starting with 6–9"],
    ["Duplicate rule", "Same customer + product + requirement within 30 days is rejected"],
    [""],
    ["Steps"],
    ["1", "Fill the Leads sheet (or copy sample rows)"],
    ["2", "Upload the file in Lead Upload module"],
    ["3", "Validate Data → Import Leads"],
    ["4", "Complete C0.1 → C0.10 before Sales Pipeline unlocks"],
  ]);
  instructions["!cols"] = [{ wch: 22 }, { wch: 64 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, leadSheet, "Leads");
  XLSX.utils.book_append_sheet(wb, instructions, "Instructions");
  return wb;
}

export function downloadSampleLeadTemplate(): void {
  downloadWorkbook(buildSampleLeadWorkbook(), "zentroflow-lead-import-template.xlsx");
}

/** Export all live opportunities as Excel */
export function buildLeadsExportWorkbook(leads: Lead[]): XLSX.WorkBook {
  const headers = [
    "Lead ID",
    "Customer ID",
    "Opportunity ID",
    "Customer Name",
    "Mobile",
    "Alternate Mobile",
    "Email",
    "District",
    "Product",
    "Source",
    "Campaign",
    "Lead Type",
    "Branch",
    "Macro Stage",
    "Micro Stage",
    "Lead Score",
    "Score Label",
    "Priority",
    "Owner",
    "Current Action",
    "Next Action",
    "Next Action At",
    "SLA",
    "SLA Status",
    "Escalation Owner",
    "Status",
  ];

  const rows = leads.map((l) => [
    l.leadId,
    l.customerId,
    l.opportunityId,
    l.customerName,
    l.mobile,
    l.alternateMobile ?? "",
    l.email ?? "",
    l.district,
    l.product,
    l.source,
    l.campaign ?? "",
    l.leadType,
    l.branch,
    l.currentStage,
    l.microStage,
    l.leadScore,
    l.scoreLabel,
    l.priority,
    l.currentOwner,
    l.currentAction,
    l.nextAction,
    l.nextActionAt,
    l.slaTime,
    l.slaCountdown ?? "",
    l.escalationOwner,
    l.status,
  ]);

  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  sheet["!cols"] = autoColWidths([headers, ...rows]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Leads");
  return wb;
}

export function exportLeadsToExcel(leads: Lead[], filename?: string): void {
  const wb = buildLeadsExportWorkbook(leads);
  downloadWorkbook(wb, filename ?? `zentroflow-leads-export-${timestamp()}.xlsx`);
}

/** Post-import summary report */
export function buildImportReportWorkbook(result: ImportBatchResult): XLSX.WorkBook {
  const summary = XLSX.utils.aoa_to_sheet([
    ["ZentroFlow Import Report"],
    ["Generated", new Date().toLocaleString()],
    [""],
    ["Metric", "Count"],
    ["Total records", result.total],
    ["Valid leads", result.valid],
    ["Duplicate leads", result.duplicate],
    ["Invalid numbers", result.invalid],
    ["Out of territory", result.outOfTerritory],
    ["Imported", result.imported],
    ["Rejected", result.rejected],
  ]);
  summary["!cols"] = [{ wch: 22 }, { wch: 28 }];

  const detailHeaders = [
    "Row Status",
    "Reason",
    "Customer Name",
    "Mobile",
    "Product",
    "Opportunity ID",
    "Branch",
    "Executive",
  ];

  const detailRows = result.rows.map((row) => {
    if (row.status === "imported") {
      return [
        "imported",
        "",
        row.customer.name,
        row.customer.mobile,
        row.opportunity.product,
        row.opportunity.opportunity_id,
        row.opportunity.branch,
        row.opportunity.current_owner,
      ];
    }
    return ["rejected", row.reason, "", "", "", "", "", ""];
  });

  const details = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
  details["!cols"] = autoColWidths([detailHeaders, ...detailRows]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summary, "Summary");
  XLSX.utils.book_append_sheet(wb, details, "Row Details");
  return wb;
}

export function exportImportReportToExcel(result: ImportBatchResult): void {
  const wb = buildImportReportWorkbook(result);
  downloadWorkbook(wb, `zentroflow-import-report-${timestamp()}.xlsx`);
}

/** Pipeline / reports export with funnel breakdown */
export function buildPipelineReportWorkbook(leads: Lead[]): XLSX.WorkBook {
  const wb = buildLeadsExportWorkbook(leads);

  const byStage: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byOwner: Record<string, number> = {};
  let hot = 0;
  let slaMissed = 0;

  for (const l of leads) {
    byStage[l.currentStage] = (byStage[l.currentStage] ?? 0) + 1;
    bySource[l.source] = (bySource[l.source] ?? 0) + 1;
    byOwner[l.currentOwner] = (byOwner[l.currentOwner] ?? 0) + 1;
    if (l.scoreLabel === "Hot") hot++;
    if (l.slaCountdown === "Overdue") slaMissed++;
  }

  const funnel = XLSX.utils.aoa_to_sheet([
    ["Stage Funnel"],
    ["Stage", "Count"],
    ...Object.entries(byStage).sort(([a], [b]) => a.localeCompare(b)),
    [""],
    ["Lead Sources"],
    ["Source", "Count"],
    ...Object.entries(bySource).sort(([, a], [, b]) => b - a),
    [""],
    ["Executive Workload"],
    ["Executive", "Leads"],
    ...Object.entries(byOwner).sort(([, a], [, b]) => b - a),
    [""],
    ["KPIs"],
    ["Total Leads", leads.length],
    ["Hot Leads", hot],
    ["SLA Missed", slaMissed],
  ]);
  funnel["!cols"] = [{ wch: 24 }, { wch: 14 }];

  XLSX.utils.book_append_sheet(wb, funnel, "Pipeline Report");
  return wb;
}

export function exportPipelineReportToExcel(leads: Lead[]): void {
  const wb = buildPipelineReportWorkbook(leads);
  downloadWorkbook(wb, `zentroflow-pipeline-report-${timestamp()}.xlsx`);
}
