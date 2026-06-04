import { useRef, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useZentroFlowStore } from "@/store/opportunity-store";
import { parseExcelFileDetailed, dedupeRowsByMobile, type ExcelLeadRow } from "@/services/excel-import.service";
import { downloadSampleFromApi } from "@/services/export.service";
import { downloadSampleLeadTemplate } from "@/services/excel-export.service";
import * as leadsApi from "@/api/leads.api";
import { refreshFromApi, mapLatestImport } from "@/services/sync.service";
import { getCurrentUserName } from "@/api/auth.api";
import { ApiClientError } from "@/lib/api";

const TEMPLATE_COLUMNS = [
  "customerName", "mobile", "product", "requirement", "district", "source", "branch", "executive",
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
    setUploadedFile(file);
    try {
      const buffer = await file.arrayBuffer();
      const { rows, usedImportReportSheet } = parseExcelFileDetailed(buffer);
      const unique = dedupeRowsByMobile(rows);
      if (unique.length === 0) {
        toast.error("No valid mobile numbers", {
          description: "Sheet needs a mobile column with 10-digit Indian numbers (6–9).",
        });
        setUploadedFile(null);
        return;
      }
      setParsedRows(unique);
      if (usedImportReportSheet) {
        toast.warning("Import report detected", {
          description: `Using Row Details (${unique.length} rows). Use your leads template for new imports.`,
        });
      } else {
        toast.success("File loaded", {
          description: `${unique.length} unique mobiles · click Validate then Import`,
        });
      }
    } catch {
      toast.error("Could not read file", { description: "Use .xlsx with customerName + mobile columns" });
      setUploadedFile(null);
    }
  };

  const runValidate = async () => {
    if (!uploadedFile && parsedRows.length === 0) {
      toast.error("No file loaded", { description: "Upload your Excel file first" });
      return;
    }
    setBusy(true);
    try {
      const result = uploadedFile
        ? await leadsApi.validateImportFile(uploadedFile)
        : await leadsApi.validateImport(parsedRows);
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
        description: `${result.valid} new mobiles · ${result.duplicate} already in system · ${result.invalid} invalid`,
      });
    } catch (err) {
      toast.error("Validation failed", { description: err instanceof ApiClientError ? err.message : "API error" });
    } finally {
      setBusy(false);
    }
  };

  const runImport = async () => {
    if (!uploadedFile && parsedRows.length === 0) {
      toast.error("No file loaded", { description: "Upload your Excel file first" });
      return;
    }
    setBusy(true);
    try {
      const result = uploadedFile
        ? await leadsApi.commitImportFile(uploadedFile, getCurrentUserName())
        : await leadsApi.commitImport(parsedRows, getCurrentUserName());
      setLastImport(mapLatestImport(result as Record<string, unknown>));
      await refreshFromApi();
      toast.success("Import complete", {
        description: `${result.imported} imported · ${result.rejected} skipped (duplicate/invalid)`,
      });
      setParsedRows([]);
      setUploadedFile(null);
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
          {fileName
            ? `Loaded: ${fileName} · ${parsedRows.length} rows with unique mobile`
            : "Upload your template → Validate → Import (unique mobile only)"}
        </p>
        <p className="text-xs text-muted-foreground">
          New mobiles are imported with whatever name/product is in the sheet; update other fields later in Lead Inbox.
        </p>
        <ActionBar>
          <Btn onClick={runValidate} disabled={busy || (!uploadedFile && parsedRows.length === 0)}>
            Validate
          </Btn>
          <Btn variant="secondary" onClick={runImport} disabled={busy || (!uploadedFile && parsedRows.length === 0)}>
            Import Leads
          </Btn>
        </ActionBar>
      </Section>

      <Section title="Import summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Total rows", previewStats.total],
            ["New (valid)", previewStats.valid],
            ["Already in system", previewStats.duplicate],
            ["Invalid mobile", previewStats.invalid],
            ["Imported", previewStats.imported],
            ["Skipped", previewStats.rejected],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Your template columns">
        <p className="text-xs font-medium text-foreground">Required: mobile (unique, 10-digit Indian)</p>
        <p className="text-xs text-muted-foreground">Optional: {TEMPLATE_COLUMNS.filter((c) => c !== "mobile").join(" · ")}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Works with <code className="text-foreground">zentroflow-leads-template (1).xlsx</code> — sheet Leads, headers customerName / mobile / product.
        </p>
      </Section>
    </ModuleShell>
  );
};

export default LeadUpload;
