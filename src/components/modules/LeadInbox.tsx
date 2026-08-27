import { useMemo, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Section, DataTable, Btn, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import MoveStageDialog from "@/components/shared/MoveStageDialog";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  PipelineStageFilterBar,
  STAGE_FILTER_ALL,
  buildStageFilterCounts,
  filterLeadsByStageFilter,
  isMacroFilter,
  resolveActiveStageMeta,
} from "@/components/shared/PipelineStageFilterBar";
import type { Lead } from "@/adapters/lead-view.adapter";
import { useOpportunityLeads } from "@/store/selectors";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { usePagination, DEFAULT_PAGE_SIZE } from "@/hooks/use-pagination";
import { LeadRowActions } from "@/components/shared/LeadRowActions";
import { BulkWhatsAppButton } from "@/components/modules/BulkWhatsAppButton";
import { BulkWhatsAppReportButton } from "@/components/modules/BulkWhatsAppReportButton";
import { SmartfloSyncButton } from "@/components/modules/SmartfloSyncButton";
import { AddLeadDialog } from "@/components/modules/AddLeadDialog";
import { initiateSmartfloAgentCall } from "@/api/smartflo.api";
import { syncDialerLead } from "@/api/dialer.api";
import { ApiClientError } from "@/lib/api";

const LeadInbox = () => {
  const { viewLead, ivrCallLead, openWhatsApp, performAction, navigate } = useDashboardActions();
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null);
  const [ivrCallingId, setIvrCallingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleCallLead = async (lead: Lead) => {
    console.log("Clicked lead data:", lead);
    setCallingLeadId(lead.leadId);
    try {
      const phoneNumber = (lead.mobile || "").replace(/\s/g, "");
      console.log("Phone number:", phoneNumber);

      if (!phoneNumber) {
        toast.error("Phone number not found");
        return;
      }

      const response = await initiateSmartfloAgentCall({
        phoneNumber,
        opportunityId: lead.opportunityId,
        customerName: lead.customerName,
      });

      console.log("Smartflo call response:", response);
      toast.success("Call initiated successfully");
    } catch (error) {
      console.error(
        "Smartflo call error:",
        error instanceof ApiClientError ? { message: error.message, status: error.status } : error,
      );
      toast.error(
        error instanceof ApiClientError ? error.message : "Failed to initiate call",
      );
    } finally {
      setCallingLeadId(null);
    }
  };

  const handleIvrCall = async (lead: Lead) => {
    setIvrCallingId(lead.leadId);
    try {
      await ivrCallLead(lead.mobile, lead.customerName, lead.opportunityId);
    } finally {
      setIvrCallingId(null);
    }
  };

  const handleDialerSync = async (lead: Lead) => {
    setSyncingId(lead.opportunityId);
    try {
      await syncDialerLead(lead.opportunityId);
      toast.success("Synced to Auto Dialer");
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Unable to sync lead with Smartflo");
    } finally {
      setSyncingId(null);
    }
  };
  const allLeads = useOpportunityLeads();
  const [moveLead, setMoveLead] = useState<Lead | null>(null);
  const [stageFilter, setStageFilter] = useState(STAGE_FILTER_ALL);

  const stageCounts = useMemo(() => buildStageFilterCounts(allLeads), [allLeads]);
  const leads = useMemo(
    () => filterLeadsByStageFilter(allLeads, stageFilter) as Lead[],
    [allLeads, stageFilter],
  );
  const activeStageMeta = useMemo(() => resolveActiveStageMeta(stageFilter), [stageFilter]);

  const pagination = usePagination(leads, DEFAULT_PAGE_SIZE);
  const { pageItems } = pagination;

  const onStageSelect = (code: string) => {
    setStageFilter(code);
    pagination.setPage(1);
  };

  return (
    <ModuleShell
      moduleId="lead-inbox"
      actions={
        <ActionBar>
          <AddLeadDialog onCreated={(id) => viewLead(id)} />
          <SmartfloSyncButton />
          <BulkWhatsAppButton />
          <BulkWhatsAppReportButton />
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
          description="Add a lead manually or import from Excel — each opportunity starts at C0.1 Contact."
        >
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <AddLeadDialog />
            <Btn variant="outline" onClick={() => navigate("lead-upload")}>
              Upload Excel
            </Btn>
          </div>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          <Section title="Filter by pipeline stage">
            <p className="mb-3 text-sm text-muted-foreground">
              Pick a macro stage (C0, C1, C1A, C2, C3) then select a step — or use{" "}
              <strong>All C1</strong> to see every lead in that pipeline section.
            </p>
            <PipelineStageFilterBar
              active={stageFilter}
              onSelect={onStageSelect}
              counts={stageCounts}
            />
            <div className="mt-4 rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                {leads.length} lead{leads.length === 1 ? "" : "s"}
                {stageFilter !== STAGE_FILTER_ALL && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    {activeStageMeta
                      ? `in ${activeStageMeta.code}`
                      : isMacroFilter(stageFilter)
                        ? `in ${stageFilter.replace("macro:", "")}`
                        : ""}
                  </span>
                )}
              </p>
              {stageFilter !== STAGE_FILTER_ALL && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Filtered from {allLeads.length} total leads in inbox
                </p>
              )}
              {leads.length > DEFAULT_PAGE_SIZE && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Showing {DEFAULT_PAGE_SIZE} per page · page {pagination.page} of {pagination.totalPages}
                </p>
              )}
            </div>
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
                    onCall={() => void handleCallLead(l)}
                    callLoading={callingLeadId === l.leadId}
                    onIvrCall={() => void handleIvrCall(l)}
                    ivrLoading={ivrCallingId === l.leadId}
                    onWhatsApp={() => openWhatsApp(l.opportunityId)}
                  />
                  <Btn
                    variant="outline"
                    disabled={syncingId === l.opportunityId}
                    onClick={() => void handleDialerSync(l)}
                  >
                    {syncingId === l.opportunityId ? "Syncing…" : "Add to Auto Dialer"}
                  </Btn>
                </div>
              </div>
            ))}
            {pageItems.length === 0 && <EmptyInbox stageFilter={stageFilter} />}
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
                    <span className="font-mono text-xs font-bold text-primary">{l.microStageCode}</span>
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
                    <div className="flex items-center gap-1">
                    <LeadRowActions
                      onView={() => viewLead(l.opportunityId)}
                      onMove={() => setMoveLead(l)}
                      onCall={() => void handleCallLead(l)}
                      callLoading={callingLeadId === l.leadId}
                      onIvrCall={() => void handleIvrCall(l)}
                      ivrLoading={ivrCallingId === l.leadId}
                      onWhatsApp={() => openWhatsApp(l.opportunityId)}
                    />
                    <Btn
                      variant="ghost"
                      className="ml-1"
                      disabled={syncingId === l.opportunityId}
                      onClick={() => void handleDialerSync(l)}
                    >
                      {syncingId === l.opportunityId ? "Syncing…" : "Sync"}
                    </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>

          {pageItems.length === 0 && leads.length > 0 && (
            <div className="hidden md:block">
              <EmptyInbox stageFilter={stageFilter} />
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

const EmptyInbox = ({ stageFilter }: { stageFilter: string }) => (
  <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
    {stageFilter === STAGE_FILTER_ALL
      ? "No leads match this filter."
      : isMacroFilter(stageFilter)
        ? `No leads are currently in ${stageFilter.replace("macro:", "")}.`
        : `No leads are currently in ${stageFilter}.`}
  </p>
);

export default LeadInbox;
