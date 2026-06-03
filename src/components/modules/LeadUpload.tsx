import ModuleShell, { Btn, Section, ActionBar, FormGrid } from "@/components/shared/ModuleShell";

const EXCEL_COLUMNS = [
  "Customer Name", "Mobile", "Alternate Mobile", "Email", "District",
  "Source", "Campaign", "Product Interest", "Lead Type", "Branch", "Executive", "Remarks",
];

const LeadUpload = () => (
  <ModuleShell
    moduleId="lead-upload"
    actions={
      <ActionBar>
        <Btn fullWidth>Upload Excel</Btn>
        <Btn variant="outline" fullWidth>Download Sample</Btn>
      </ActionBar>
    }
  >
    <Section title="Import workflow">
      <ActionBar>
        <Btn>Validate Data</Btn>
        <Btn>Import Leads</Btn>
        <Btn variant="danger">Reject Invalid Rows</Btn>
      </ActionBar>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Columns: {EXCEL_COLUMNS.join(" · ")}
      </p>
    </Section>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {[
        ["Total records", 250],
        ["Valid leads", 218],
        ["Duplicate leads", 12],
        ["Invalid numbers", 8],
        ["Out of territory", 5],
        ["Imported", 206],
        ["Rejected", 32],
      ].map(([label, value]) => (
        <div key={String(label)} className="surface-card p-4 text-center sm:text-left">
          <p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>

    <Section title="Post-upload actions">
      <ActionBar>
        <Btn variant="secondary">Merge Duplicate</Btn>
        <Btn variant="secondary">New Opportunity</Btn>
        <Btn variant="secondary">Assign Branch</Btn>
        <Btn variant="secondary">Assign Executive</Btn>
        <Btn>Start Automation</Btn>
      </ActionBar>
    </Section>

    <Section title="C0.1 · Lead captured">
      <FormGrid fields={["Source", "Campaign", "Product", "Territory", "Branch", "Lead Type"]} />
      <ActionBar>
        <Btn>Save Lead</Btn>
        <Btn variant="outline">Generate IDs</Btn>
        <Btn variant="outline">Run Duplicate Check</Btn>
      </ActionBar>
    </Section>
  </ModuleShell>
);

export default LeadUpload;
