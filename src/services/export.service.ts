import * as leadsApi from "@/api/leads.api";
import * as reportsApi from "@/api/reports.api";
import { getLatestImport } from "@/api/leads.api";
import { downloadBlob } from "@/lib/download";
import { exportImportReportToExcel } from "@/services/excel-export.service";
import { mapLatestImport } from "@/services/sync.service";
import type { ImportBatchResult } from "@/services/excel-import.service";
import { getLeadsSnapshot } from "@/domain/leads";
import { exportLeadsToExcel, exportPipelineReportToExcel } from "@/services/excel-export.service";

export async function downloadSampleFromApi(): Promise<boolean> {
  try {
    const blob = await leadsApi.downloadImportTemplate();
    downloadBlob(blob, "zentroflow-leads-template.xlsx");
    return true;
  } catch {
    return false;
  }
}

export async function exportLeadsFromApi(): Promise<boolean> {
  try {
    const blob = await reportsApi.downloadReportExport();
    downloadBlob(blob, `zentroflow-export-${Date.now()}.xlsx`);
    return true;
  } catch {
    const leads = getLeadsSnapshot();
    if (leads.length === 0) return false;
    exportLeadsToExcel(leads);
    return true;
  }
}

export async function exportPipelineFromApi(): Promise<boolean> {
  try {
    const blob = await reportsApi.downloadReportExport();
    downloadBlob(blob, `zentroflow-pipeline-${Date.now()}.xlsx`);
    return true;
  } catch {
    const leads = getLeadsSnapshot();
    if (leads.length === 0) return false;
    exportPipelineReportToExcel(leads);
    return true;
  }
}

export async function exportImportReportFromApi(
  localFallback: ImportBatchResult | null,
): Promise<boolean> {
  try {
    const latest = await getLatestImport();
    const mapped = mapLatestImport(latest as Record<string, unknown> | null);
    if (mapped) {
      exportImportReportToExcel(mapped);
      return true;
    }
  } catch {
    /* use local */
  }
  if (localFallback) {
    exportImportReportToExcel(localFallback);
    return true;
  }
  return false;
}
