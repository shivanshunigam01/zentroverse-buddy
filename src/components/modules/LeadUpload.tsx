import { useRef, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useZentroFlowStore } from "@/store/opportunity-store";
import {
  assignIdsToRows,
  importLeadRows,
  parseExcelFile,
  type ExcelLeadRow,
} from "@/services/excel-import.service";
import { downloadSampleLeadTemplate } from "@/services/excel-export.service";

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

  const lastImport = useZentroFlowStore((s) => s.lastImport);
  const applyImportResult = useZentroFlowStore((s) => s.applyImportResult);
  const listCustomers = useZentroFlowStore((s) => s.listCustomers);
  const listOpportunities = useZentroFlowStore((s) => s.listOpportunities);
  const { navigate, performAction } = useDashboardActions();

  const stats = lastImport ?? EMPTY_STATS;
  const previewStats = parsedRows.length > 0 && !lastImport
    ? { ...EMPTY_STATS, total: parsedRows.length, valid: parsedRows.length }
    : stats;

  const handleFile = async (file: File) => {
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const rows = parseExcelFile(buffer);
      if (rows.length === 0) {
        toast.error("Empty file", { description: "No data rows found in the sheet" });
        return;
      }
      setParsedRows(rows);
      toast.success("File loaded", { description: `${rows.length} records ready to validate` });
    } catch {
      toast.error("Could not read file", { description: "Use .xlsx or .csv with the sample columns" });
    }
  };

  const runGenerateIds = () => {
    if (parsedRows.length === 0) {
      toast.error("No file loaded", { description: "Upload an Excel file first" });
      return;
    }
    const withIds = assignIdsToRows(parsedRows);
    setParsedRows(withIds);
    const sample = withIds[0];
    toast.success("IDs generated", {
      description: sample
        ? `${withIds.length} rows · e.g. Lead ${sample.leadId} · CU ${sample.customerId} · OP ${sample.opportunityId}`
        : `${withIds.length} rows updated`,
    });
  };

  const runValidate = () => {
    if (parsedRows.length === 0) {
      toast.error("No file loaded", { description: "Upload an Excel file first" });
      return;
    }
    const invalid = parsedRows.filter((r) => !r.customerName || !r.mobile || !r.product).length;
    toast.success("Validation complete", {
      description: `${parsedRows.length - invalid} valid · ${invalid} invalid rows`,
    });
  };

  const runImport = async () => {
    if (parsedRows.length === 0) {
      toast.error("No file loaded", { description: "Upload an Excel file first" });
      return;
    }
    const result = await importLeadRows(parsedRows, listCustomers(), listOpportunities());
    applyImportResult(result);
    toast.success("Import complete", {
      description: `${result.imported} imported · ${result.rejected} rejected`,
    });
    setParsedRows([]);
    setTimeout(() => navigate("lead-inbox"), 500);
  };

  const downloadSample = () => {
    downloadSampleLeadTemplate();
    toast.success("Sample downloaded", { description: "zentroflow-lead-import-template.xlsx" });
  };

  return (
    <ModuleShell
      moduleId="lead-upload"
      actions={
        <ActionBar>
          <Btn fullWidth onClick={() => fileRef.current?.click()}>
            Upload Excel
          </Btn>
          <Btn variant="outline" fullWidth onClick={downloadSample}>
            Download Sample Format
          </Btn>
          <Btn
            variant="outline"
            fullWidth
            disabled={!lastImport}
            onClick={() => void performAction("Export Import Report")}
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
        }}
      />

      {fileName && (
        <p className="rounded-xl bg-primary/5 px-4 py-2 text-sm text-primary">
          Loaded: <strong>{fileName}</strong>
          {parsedRows.length > 0 && ` · ${parsedRows.length} rows pending import`}
        </p>
      )}

      <Section title="Step 1 · Import workflow">
        <p className="mb-4 text-sm text-muted-foreground">
          Your journey starts here. Upload leads from Excel — each row creates a customer + opportunity at{" "}
          <strong>C0.1 Contact</strong>.
        </p>
        <ActionBar>
          <Btn onClick={runValidate} disabled={parsedRows.length === 0}>
            Validate Data
          </Btn>
          <Btn variant="secondary" onClick={runGenerateIds} disabled={parsedRows.length === 0}>
            Generate IDs
          </Btn>
          <Btn onClick={() => void runImport()} disabled={parsedRows.length === 0}>
            Import Leads
          </Btn>
          <Btn
            variant="danger"
            disabled={parsedRows.length === 0}
            onClick={() => {
              setParsedRows([]);
              setFileName(null);
              toast.info("Pending rows cleared");
            }}
          >
            Reject Invalid Rows
          </Btn>
        </ActionBar>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Columns: {EXCEL_COLUMNS.join(" · ")}
        </p>
      </Section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {(
          [
            ["Total records", previewStats.total],
            ["Valid leads", previewStats.valid],
            ["Duplicate leads", previewStats.duplicate],
            ["Invalid numbers", previewStats.invalid],
            ["Out of territory", previewStats.outOfTerritory],
            ["Imported", previewStats.imported],
            ["Rejected", previewStats.rejected],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="surface-card p-4 text-center sm:text-left">
            <p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {parsedRows.length > 0 && (
        <Section title="Preview (first 5 rows)">
          <div className="table-scroll">
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Mobile</th>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Lead ID</th>
                  <th className="py-2 pr-3">Customer ID</th>
                  <th className="py-2 pr-3">Opportunity ID</th>
                  <th className="py-2">Branch</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-2 pr-3 font-medium">{r.customerName}</td>
                    <td className="py-2 pr-3">{r.mobile}</td>
                    <td className="py-2 pr-3">{r.product}</td>
                    <td className="py-2 pr-3 font-mono text-[10px] text-primary">
                      {r.leadId ?? "— click Generate IDs"}
                    </td>
                    <td className="py-2 pr-3 font-mono text-[10px]">{r.customerId ?? "—"}</td>
                    <td className="py-2 pr-3 font-mono text-[10px]">{r.opportunityId ?? "—"}</td>
                    <td className="py-2">{r.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section title="After import">
        <p className="mb-3 text-sm text-muted-foreground">
          Complete each C0 micro stage in order (C0.1 → C0.10) before Sales Pipeline (C1) unlocks.
        </p>
        <ActionBar>
          <Btn
            variant="secondary"
            disabled={!lastImport?.imported}
            onClick={() => void performAction("Run Duplicate Check")}
          >
            Run Duplicate Check
          </Btn>
          <Btn
            variant="outline"
            disabled={!lastImport}
            onClick={() => void performAction("Export Import Report")}
          >
            Export Import Report
          </Btn>
          <Btn
            disabled={!lastImport?.imported}
            onClick={() => navigate("lead-inbox")}
          >
            Open Lead Inbox
          </Btn>
        </ActionBar>
      </Section>
    </ModuleShell>
  );
};

export default LeadUpload;
