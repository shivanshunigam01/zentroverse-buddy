import { useMemo, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Section, FilterChips, DataTable, Btn, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import MoveStageDialog from "@/components/shared/MoveStageDialog";
import { TablePagination } from "@/components/shared/TablePagination";
import type { Lead } from "@/adapters/lead-view.adapter";
import { useOpportunityLeads } from "@/store/selectors";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/use-pagination";
import { LeadRowActions } from "@/components/shared/LeadRowActions";

const FILTERS = ["All", "Stage", "Owner", "Priority", "Hot/Warm/Cold", "Source", "SLA Missed", "Today Follow-up"];

function filterLeads(leads: Lead[], filter: string): Lead[] {
  switch (filter) {
    case "SLA Missed":
      return leads.filter((l) => l.slaCountdown === "Overdue");
    case "Today Follow-up":
      return leads.filter((l) => l.nextActionAt.toLowerCase().includes("today"));
    case "Hot/Warm/Cold":
      return leads.filter((l) => ["Hot", "Warm", "Cold"].includes(l.scoreLabel));
    default:
      return leads;
  }
}

const LeadInbox = () => {
  const { viewLead, callLead, openWhatsApp, performAction } = useDashboardActions();
  const allLeads = useOpportunityLeads();
  const [moveLead, setMoveLead] = useState<Lead | null>(null);
  const [filter, setFilter] = useState("All");

  const leads = useMemo(() => filterLeads(allLeads, filter), [allLeads, filter]);
  const pagination = usePagination(leads, DEFAULT_PAGE_SIZE);
  const { pageItems } = pagination;

  const onFilterSelect = (f: string) => {
    setFilter(f);
    if (["Stage", "Owner", "Priority", "Source"].includes(f)) {
      toast.info(`${f} filter`, { description: "Use inbox columns · full filter UI coming with API" });
    }
  };

  return (
    <ModuleShell
      moduleId="lead-inbox"
      actions={
        <ActionBar>
          <Btn
            variant="outline"
            disabled={allLeads.length === 0}
            onClick={() => void performAction("Export Excel")}
          >
            Export Excel
          </Btn>
        </ActionBar>
      }
    >
      {allLeads.length === 0 ? (
        <EmptyState
          title="Inbox is empty"
          description="Import leads from Excel — each opportunity starts at C0.1 Contact. Complete stages in order before moving to C1."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <Section title="Filters">
            <FilterChips items={FILTERS} active={filter} onSelect={onFilterSelect} />
            <p className="mt-2 text-xs text-muted-foreground">
              {leads.length} lead{leads.length === 1 ? "" : "s"}
              {filter !== "All" ? ` (filtered from ${allLeads.length})` : ""}
              {leads.length > DEFAULT_PAGE_SIZE
                ? ` · showing ${DEFAULT_PAGE_SIZE} per page`
                : ""}
            </p>
          </Section>

          {leads.length > 0 && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              rangeStart={pagination.rangeStart}
              rangeEnd={pagination.rangeEnd}
              pageSize={pagination.pageSize}
              canPrev={pagination.canPrev}
              canNext={pagination.canNext}
              onPrev={pagination.goPrev}
              onNext={pagination.goNext}
              onFirst={pagination.goFirst}
              onLast={pagination.goLast}
              onPageChange={pagination.setPage}
            />
          )}

          <div className="inbox-mobile-scroll space-y-3 md:hidden">
            {pageItems.map((l) => (
              <div key={l.leadId} className="space-y-2">
                <LeadCardStrip lead={l} onClick={() => viewLead(l.opportunityId)} />
                <div className="px-1">
                  <LeadRowActions
                    variant="labeled"
                    onView={() => viewLead(l.opportunityId)}
                    onMove={() => setMoveLead(l)}
                    onCall={() => callLead(l.mobile, l.customerName)}
                    onWhatsApp={() => openWhatsApp(l.opportunityId)}
                  />
                </div>
              </div>
            ))}
            {pageItems.length === 0 && <EmptyInbox />}
          </div>

          <DataTable minWidth={1400}>
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {[
                  "Lead ID",
                  "Customer ID",
                  "Opportunity ID",
                  "Customer",
                  "Mobile",
                  "Product",
                  "Stage",
                  "Score",
                  "Owner",
                  "Action",
                  "SLA",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((l) => (
                <tr key={l.leadId} className="border-b border-border/50 transition-colors hover:bg-secondary/25">
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="font-mono text-xs">{l.leadId}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="font-mono text-xs text-muted-foreground">{l.customerId}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="font-mono text-xs text-muted-foreground">{l.opportunityId}</span>
                  </td>
                  <td className="px-3 py-3 font-semibold">{l.customerName}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">{l.mobile}</td>
                  <td className="px-3 py-3 text-xs">{l.product}</td>
                  <td className="px-3 py-3">
                    <span className="font-mono text-xs font-bold text-primary">{l.currentStage}</span>
                    <p className="max-w-[140px] truncate text-[10px] text-muted-foreground">{l.microStage}</p>
                  </td>
                  <td className="px-3 py-3 text-xs font-semibold">
                    {l.leadScore} {l.scoreLabel}
                  </td>
                  <td className="px-3 py-3 text-xs">{l.currentOwner}</td>
                  <td className="max-w-[140px] truncate px-3 py-3 text-xs">{l.currentAction}</td>
                  <td
                    className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${l.slaCountdown === "Overdue" ? "text-destructive" : ""}`}
                  >
                    {l.slaTime}
                  </td>
                  <td className="px-3 py-3 text-xs">{l.status}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <LeadRowActions
                      onView={() => viewLead(l.opportunityId)}
                      onMove={() => setMoveLead(l)}
                      onCall={() => callLead(l.mobile, l.customerName)}
                      onWhatsApp={() => openWhatsApp(l.opportunityId)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>

          {pageItems.length === 0 && leads.length > 0 && (
            <div className="hidden md:block">
              <EmptyInbox />
            </div>
          )}

          {leads.length > 0 && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              rangeStart={pagination.rangeStart}
              rangeEnd={pagination.rangeEnd}
              pageSize={pagination.pageSize}
              canPrev={pagination.canPrev}
              canNext={pagination.canNext}
              onPrev={pagination.goPrev}
              onNext={pagination.goNext}
              onFirst={pagination.goFirst}
              onLast={pagination.goLast}
              onPageChange={pagination.setPage}
            />
          )}

          {moveLead && (
            <MoveStageDialog open lead={moveLead} onClose={() => setMoveLead(null)} onConfirm={() => setMoveLead(null)} />
          )}
        </div>
      )}
    </ModuleShell>
  );
};

const EmptyInbox = () => (
  <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
    No leads match this filter.
  </p>
);

export default LeadInbox;
