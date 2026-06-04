import { useRef, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { ApiLoadingOverlay } from "@/components/shared/ApiLoadingOverlay";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useZentroFlowStore } from "@/store/opportunity-store";
import {
  parseExcelFileDetailed,
  dedupeRowsByMobile,
  computeLocalImportStats,
  type ExcelLeadRow,
} from "@/services/excel-import.service";
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
  const [summary, setSummary] = useState<typeof EMPTY_STATS>(EMPTY_STATS);
  const [busy, setBusy] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const lastImport = useZentroFlowStore((s) => s.lastImport);
  const setLastImport = useZentroFlowStore((s) => s.setLastImport);
  const { navigate, performAction } = useDashboardActions();

  const displayStats = fileName ? summary : (lastImport ?? EMPTY_STATS);

  const applySummary = (stats: typeof EMPTY_STATS) => {
    setSummary(stats);
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setUploadedFile(file);
    setLoadingMessage("Reading Excel…");
    try {
      const buffer = await file.arrayBuffer();
      const { rows, usedImportReportSheet } = parseExcelFileDetailed(buffer);
      if (rows.length === 0) {
        toast.error("Empty file", { description: "No data rows in sheet Leads." });
        setUploadedFile(null);
        setFileName(null);
        applySummary(EMPTY_STATS);
        return;
      }

      const local = computeLocalImportStats(rows);
      const unique = dedupeRowsByMobile(rows);
      setParsedRows(unique);

      if (local.valid === 0) {
        toast.error("No valid mobile numbers", {
          description: `${local.invalid} rows have invalid mobile format.`,
        });
      }
      applySummary(local);

      if (usedImportReportSheet) {
        toast.warning("Import report detected", { description: "Prefer zentroflow-leads-template.xlsx for imports." });
      }

      setLoadingMessage("Checking against database…");
      try {
        const result = await leadsApi.validateImportFile(file);
        applySummary({
          total: result.total,
          valid: result.valid,
          duplicate: result.duplicate,
          invalid: result.invalid,
          outOfTerritory: result.outOfTerritory,
          imported: 0,
          rejected: 0,
        });
        toast.success("File ready", {
          description: `${result.valid} new · ${result.duplicate} in DB · ${result.invalid} bad mobile`,
        });
      } catch (err) {
        toast.warning("Using local preview", {
          description:
            err instanceof ApiClientError
              ? `${err.message} — deploy latest API for DB check.`
              : "Could not reach API — counts are from file only.",
        });
      }
    } catch {
      toast.error("Could not read file", { description: "Use zentroflow-leads-template.xlsx (sheet Leads)" });
      setUploadedFile(null);
      setFileName(null);
      applySummary(EMPTY_STATS);
    } finally {
      setLoadingMessage(null);
    }
  };

  const runValidate = async () => {
    if (!uploadedFile && parsedRows.length === 0) {
      toast.error("No file loaded");
      return;
    }
    setBusy(true);
    setLoadingMessage("Validating leads…");
    try {
      const result = uploadedFile
        ? await leadsApi.validateImportFile(uploadedFile)
        : await leadsApi.validateImport(parsedRows);
      applySummary({
        total: result.total,
        valid: result.valid,
        duplicate: result.duplicate,
        invalid: result.invalid,
        outOfTerritory: result.outOfTerritory,
        imported: 0,
        rejected: 0,
      });
      toast.success("Validation complete", {
        description: `${result.valid} new · ${result.duplicate} already in DB · ${result.invalid} bad mobile`,
      });
    } catch (err) {
      toast.error("Validation failed", { description: err instanceof ApiClientError ? err.message : "API error" });
    } finally {
      setBusy(false);
      setLoadingMessage(null);
    }
  };

  const runImport = async () => {
    if (!uploadedFile && parsedRows.length === 0) {
      toast.error("No file loaded");
      return;
    }
    if (summary.valid === 0) {
      toast.error("Nothing to import", { description: "No new unique mobiles. All rows are duplicate or invalid." });
      return;
    }
    setBusy(true);
    setLoadingMessage("Importing leads…");
    try {
      const result = uploadedFile
        ? await leadsApi.commitImportFile(uploadedFile, getCurrentUserName())
        : await leadsApi.commitImport(parsedRows, getCurrentUserName());
      const mapped = mapLatestImport(result as Record<string, unknown>);
      if (mapped) {
        setLastImport(mapped);
        applySummary({
          total: mapped.total,
          valid: mapped.valid,
          duplicate: mapped.duplicate,
          invalid: mapped.invalid,
          outOfTerritory: mapped.outOfTerritory,
          imported: mapped.imported,
          rejected: mapped.rejected,
        });
      }
      setLoadingMessage("Syncing inbox…");
      await refreshFromApi();
      toast.success("Import complete", {
        description: `${result.imported} imported · ${result.rejected} skipped`,
      });
      setParsedRows([]);
      setUploadedFile(null);
      setFileName(null);
      setTimeout(() => navigate("lead-inbox"), 500);
    } catch (err) {
      toast.error("Import failed", { description: err instanceof ApiClientError ? err.message : "API error" });
    } finally {
      setBusy(false);
      setLoadingMessage(null);
    }
  };

  const downloadSample = async () => {
    setLoadingMessage("Downloading template…");
    try {
      const ok = await downloadSampleFromApi();
      if (!ok) downloadSampleLeadTemplate();
      toast.success("Sample downloaded");
    } finally {
      setLoadingMessage(null);
    }
  };

  return (
    <ModuleShell
      moduleId="lead-upload"
      actions={
        <ActionBar>
          <Btn fullWidth onClick={() => fileRef.current?.click()} disabled={busy}>
            Upload Excel
          </Btn>
          <Btn variant="outline" fullWidth onClick={() => void downloadSample()} disabled={busy}>
            Download Sample Format
          </Btn>
          <Btn
            variant="outline"
            fullWidth
            disabled={!lastImport || busy}
            onClick={() => performAction("Export Import Report")}
          >
            Export Import Report
          </Btn>
        </ActionBar>
      }
    >
      {loadingMessage ? <ApiLoadingOverlay message={loadingMessage} /> : null}

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
            ? `Loaded: ${fileName} — summary updates on every upload`
            : "Upload zentroflow-leads-template.xlsx"}
        </p>
        <ActionBar>
          <Btn onClick={runValidate} disabled={busy || !fileName}>
            Re-validate
          </Btn>
          <Btn variant="secondary" onClick={runImport} disabled={busy || !fileName || summary.valid === 0}>
            Import Leads ({summary.valid} new)
          </Btn>
        </ActionBar>
      </Section>

      <Section title="Import summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Total rows", displayStats.total],
            ["New (valid)", displayStats.valid],
            ["Already in system", displayStats.duplicate],
            ["Invalid mobile", displayStats.invalid],
            ["Imported", displayStats.imported],
            ["Skipped", displayStats.rejected],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Template columns">
        <p className="text-xs font-medium text-foreground">Required: mobile (unique)</p>
        <p className="text-xs text-muted-foreground">Optional: {TEMPLATE_COLUMNS.filter((c) => c !== "mobile").join(" · ")}</p>
      </Section>
    </ModuleShell>
  );
};

export default LeadUpload;
