import { useRef, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useZentroFlowStore } from "@/store/opportunity-store";
import { parseExcelFileDetailed, type ExcelLeadRow } from "@/services/excel-import.service";
import { downloadSampleFromApi } from "@/services/export.service";
import { downloadSampleLeadTemplate } from "@/services/excel-export.service";
import * as leadsApi from "@/api/leads.api";
import { refreshFromApi, mapLatestImport } from "@/services/sync.service";
import { getCurrentUserName } from "@/api/auth.api";
import { ApiClientError } from "@/lib/api";

const EXCEL_COLUMNS = [
  "Customer Name", "Mobile", "Alternate Mobile", "Email", "District",
  "Source", "Campaign", "Product Interest", "Lead Type", "Branch", "Executive", "Remarks",
];

const EMPTY_STATS = {
  total: 0,
  valid: 0,
  duplicate: 0,
  invalid: 0,
  outOfTerritory: 0,
  imported: 0,
  rejected: 0,
};

const LeadUpload = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<ExcelLeadRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validateStats, setValidateStats] = useState<typeof EMPTY_STATS | null>(null);
  const [busy, setBusy] = useState(false);

  const lastImport = useZentroFlowStore((s) => s.lastImport);
  const setLastImport = useZentroFlowStore((s) => s.setLastImport);
  const { navigate, performAction } = useDashboardActions();

  const stats = validateStats ?? lastImport ?? EMPTY_STATS;
  const previewStats = parsedRows.length > 0 && !lastImport && !validateStats
    ? { ...EMPTY_STATS, total: parsedRows.length, valid: parsedRows.length }
    : stats;

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setValidateStats(null);
    try {
      const buffer = await file.arrayBuffer();
      const { rows, usedImportReportSheet } = parseExcelFileDetailed(buffer);
      if (rows.length === 0) {
        toast.error("Wrong Excel format", {
          description:
            "Use “Download Sample Format” on this page — not “Export Import Report”. Need columns: Customer Name, Mobile, Product Interest.",
        });
        return;
      }
      setParsedRows(rows);
      if (usedImportReportSheet) {
        toast.warning("Import report detected", {
          description: `Using “Row Details” (${rows.length} rows). For new leads, use Download Sample Format instead.`,
        });
      } else {
        toast.success("File loaded", { description: `${rows.length} records ready to validate` });
      }
    } catch {
      toast.error("Could not read file", { description: "Use .xlsx or .csv with the sample columns" });
    }
  };

  const runGenerateIds = async () => {
    if (parsedRows.length === 0) {
      toast.error("No file loaded", { description: "Upload an Excel file first" });
      return;
    }
    setBusy(true);
    try {
      const apiRows = await leadsApi.generateImportIds(parsedRows);
      const mapped: ExcelLeadRow[] = parsedRows.map((row, i) => ({
        ...row,
        leadId: apiRows[i]?.leadId,
        customerId: apiRows[i]?.customerId,
        opportunityId: apiRows[i]?.opportunityId,
      }));
      setParsedRows(mapped);
      const sample = mapped[0];
      toast.success("IDs generated", {
        description: sample
          ? `${mapped.length} rows · Lead ${sample.leadId} · CU ${sample.customerId} · OP ${sample.opportunityId}`
          : `${mapped.length} rows updated`,
      });
    } catch (err) {
      toast.error("Generate IDs failed", { description: err instanceof ApiClientError ? err.message : "API error" });
    } finally {
      setBusy(false);
    }
  };

  const runValidate = async () => {
    if (parsedRows.length === 0) {
      toast.error("No file loaded", { description: "Upload an Excel file first" });
      return;
    }
    const payload = leadsApi.toApiRows(parsedRows);
    if (payload.length === 0) {
      toast.error("No valid mobile numbers", {
        description: "Each row needs a 10-digit Indian mobile (6–9). Name and product can be empty.",
      });
      return;
    }
    setBusy(true);
    try {
      const result = await leadsApi.validateImport(parsedRows);
      setValidateStats({
        total: result.total,
        valid: result.valid,
        duplicate: result.duplicate,
        invalid: result.invalid,
        outOfTerritory: result.outOfTerritory,
        imported: 0,
        rejected: 0,
      });
      toast.success("Validation complete", {
        description: `${result.valid} valid · ${result.duplicate} duplicate · ${result.invalid} invalid`,
      });
    } catch (err) {
      toast.error("Validation failed", { description: err instanceof ApiClientError ? err.message : "API error" });
    } finally {
      setBusy(false);
    }
  };

  const runImport = async () => {
    if (parsedRows.length === 0) {
      toast.error("No file loaded", { description: "Upload an Excel file first" });
      return;
    }
    setBusy(true);
    try {
      const result = await leadsApi.commitImport(parsedRows, getCurrentUserName());
      setLastImport(mapLatestImport(result as Record<string, unknown>));
      await refreshFromApi();
      toast.success("Import complete", {
        description: `${result.imported} imported · ${result.rejected} rejected`,
      });
      setParsedRows([]);
      setValidateStats(null);
      setTimeout(() => navigate("lead-inbox"), 500);
    } catch (err) {
      toast.error("Import failed", { description: err instanceof ApiClientError ? err.message : "API error" });
    } finally {
      setBusy(false);
    }
  };

  const downloadSample = async () => {
    const ok = await downloadSampleFromApi();
    if (!ok) downloadSampleLeadTemplate();
    toast.success("Sample downloaded", { description: "zentroflow-leads-template.xlsx" });
  };

  return (
    <ModuleShell
      moduleId="lead-upload"
      actions={
        <ActionBar>
          <Btn fullWidth onClick={() => fileRef.current?.click()} disabled={busy}>
            Upload Excel
          </Btn>
          <Btn variant="outline" fullWidth onClick={downloadSample} disabled={busy}>
            Download Sample Format
          </Btn>
          <Btn
            variant="outline"
            fullWidth
            disabled={!lastImport}
            onClick={() => performAction("Export Import Report")}
          >
            Export Import Report
          </Btn>
        </ActionBar>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />

      <Section title="Excel import pipeline">
        <p className="text-sm text-muted-foreground">
          {fileName ? `Loaded: ${fileName} · ${parsedRows.length} rows` : "Upload → Validate → Generate IDs → Import (API-backed)"}
        </p>
        <ActionBar>
          <Btn onClick={runValidate} disabled={busy || parsedRows.length === 0}>
            Validate Data
          </Btn>
          <Btn variant="outline" onClick={runGenerateIds} disabled={busy || parsedRows.length === 0}>
            Generate IDs
          </Btn>
          <Btn variant="secondary" onClick={runImport} disabled={busy || parsedRows.length === 0}>
            Import Leads
          </Btn>
        </ActionBar>
      </Section>

      <Section title="Import summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Total rows", previewStats.total],
            ["Valid", previewStats.valid],
            ["Duplicate", previewStats.duplicate],
            ["Invalid", previewStats.invalid],
            ["Imported", previewStats.imported],
            ["Rejected", previewStats.rejected],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Expected columns">
        <p className="text-xs font-medium text-foreground">Required: Mobile (10-digit Indian number)</p>
        <p className="text-xs text-muted-foreground">Optional: {EXCEL_COLUMNS.filter((c) => c !== "Mobile").join(" · ")}</p>
      </Section>
    </ModuleShell>
  );
};

export default LeadUpload;
