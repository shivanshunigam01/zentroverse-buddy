import { useMemo, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Section, Btn, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
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
import { LeadShowcaseCard } from "@/components/shared/LeadShowcaseCard";
import { BulkWhatsAppButton } from "@/components/modules/BulkWhatsAppButton";
import { BulkWhatsAppReportButton } from "@/components/modules/BulkWhatsAppReportButton";
import { SmartfloSyncButton } from "@/components/modules/SmartfloSyncButton";
import { AddLeadDialog } from "@/components/modules/AddLeadDialog";
import { initiateSmartfloAgentCall } from "@/api/smartflo.api";
import { syncDialerLead, syncSelectedDialerLeads } from "@/api/dialer.api";
import { ApiClientError } from "@/lib/api";
import { refreshFromApi, refreshOpportunity } from "@/services/sync.service";
import { Radio } from "lucide-react";

function toastForSyncResult(
  result: {
    result?: string;
    skipped?: boolean;
    smartflo_sync_status?: string;
    smartflo_lead_id?: string | null;
    error?: string;
  },
  customerName: string,
) {
  if (result.result === "already_synced" || result.skipped) {
    toast.message("Already exists in Smartflo", {
      description: `${customerName} was skipped (already synced). Use Resync to force upload.`,
    });
    return;
  }
  if (result.smartflo_sync_status === "FAILED" || result.result === "failed") {
    toast.error("Failed", {
      description: result.error || `Could not sync ${customerName}`,
    });
    return;
  }
  toast.success("Synced successfully", {
    description: result.smartflo_lead_id
      ? `Smartflo lead ${result.smartflo_lead_id}`
      : `${customerName} is on the dialer list`,
  });
}

const LeadInbox = () => {
  const { viewLead, ivrCallLead, openWhatsApp, performAction, navigate } = useDashboardActions();
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null);
  const [ivrCallingId, setIvrCallingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkSyncing, setBulkSyncing] = useState(false);

  const handleCallLead = async (lead: Lead) => {
    setCallingLeadId(lead.leadId);
    try {
      const phoneNumber = (lead.mobile || "").replace(/\s/g, "");
      if (!phoneNumber) {
        toast.error("Invalid phone number");
        return;
      }
      await initiateSmartfloAgentCall({
        phoneNumber,
        opportunityId: lead.opportunityId,
        customerName: lead.customerName,
      });
      toast.success("Call initiated successfully");
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to initiate call");
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
    const resync = lead.smartfloSyncStatus === "SYNCED";
    try {
      const result = await syncDialerLead(lead.opportunityId, resync);
      toastForSyncResult(result, lead.customerName);
      await refreshOpportunity(lead.opportunityId).catch(() => undefined);
    } catch (error) {
      const msg = error instanceof ApiClientError ? error.message : "Unable to sync lead with Smartflo";
      const code = error instanceof ApiClientError ? error.code : "";
      if (code === "INVALID_LEAD" || /phone|mobile/i.test(msg)) {
        toast.error("Invalid phone number", { description: msg });
      } else {
        toast.error("Failed", { description: msg });
      }
    } finally {
      setSyncingId(null);
    }
  };

  const toggleSelect = (opportunityId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(opportunityId)) next.delete(opportunityId);
      else next.add(opportunityId);
      return next;
    });
  };

  const handleSyncSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast.message("Select leads first", { description: "Check one or more leads, then Sync to Smartflo." });
      return;
    }
    setBulkSyncing(true);
    try {
      const result = await syncSelectedDialerLeads(ids, false);
      const parts = [
        result.synced != null ? `${result.synced} synced` : `${result.uploaded} synced`,
        result.alreadySynced ? `${result.alreadySynced} already exists` : null,
        result.failed ? `${result.failed} failed` : null,
      ].filter(Boolean);
      if (result.failed && result.failed > 0) {
        toast.error("Sync finished with errors", { description: parts.join(" · ") });
      } else if (result.alreadySynced && result.alreadySynced === result.total) {
        toast.message("Already exists", { description: "Selected leads were already on the Smartflo list." });
      } else {
        toast.success("Synced successfully", { description: parts.join(" · ") });
      }
      setSelectedIds(new Set());
      await refreshFromApi().catch(() => undefined);
    } catch (error) {
      toast.error("Failed", {
        description: error instanceof ApiClientError ? error.message : "Could not sync selected leads",
      });
    } finally {
      setBulkSyncing(false);
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

  const pageAllSelected =
    pageItems.length > 0 && pageItems.every((l) => selectedIds.has(l.opportunityId));

  const toggleSelectPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (pageAllSelected) {
        pageItems.forEach((l) => next.delete(l.opportunityId));
      } else {
        pageItems.forEach((l) => next.add(l.opportunityId));
      }
      return next;
    });
  };

  return (
    <ModuleShell
      moduleId="lead-inbox"
      actions={
        <ActionBar>
          <AddLeadDialog onCreated={(id) => viewLead(id)} />
          <Btn
            variant="outline"
            disabled={bulkSyncing || selectedIds.size === 0}
            onClick={() => void handleSyncSelected()}
          >
            <span className="inline-flex items-center gap-2">
              <Radio className="h-4 w-4" aria-hidden />
              {bulkSyncing ? "Syncing…" : `Sync to Smartflo${selectedIds.size ? ` (${selectedIds.size})` : ""}`}
            </span>
          </Btn>
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
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
              <div>
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
              </div>
              {leads.length > DEFAULT_PAGE_SIZE && (
                <p className="text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} · {DEFAULT_PAGE_SIZE} / page
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

          <Section title="Lead showcase">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Select leads, then Sync to Smartflo — or sync one lead from its card. Already-synced leads are skipped unless you Resync.
              </p>
              {pageItems.length > 0 ? (
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={pageAllSelected}
                    onChange={toggleSelectPage}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Select page ({pageItems.length})
                </label>
              ) : null}
            </div>
            {pageItems.length === 0 ? (
              <EmptyInbox stageFilter={stageFilter} />
            ) : (
              <div className="space-y-3">
                {pageItems.map((l) => (
                  <LeadShowcaseCard
                    key={l.leadId}
                    lead={l}
                    selected={selectedIds.has(l.opportunityId)}
                    onToggleSelect={() => toggleSelect(l.opportunityId)}
                    onView={() => viewLead(l.opportunityId)}
                    onMove={() => setMoveLead(l)}
                    onCall={() => void handleCallLead(l)}
                    callLoading={callingLeadId === l.leadId}
                    onIvrCall={() => void handleIvrCall(l)}
                    ivrLoading={ivrCallingId === l.leadId}
                    onWhatsApp={() => openWhatsApp(l.opportunityId)}
                    onDialerSync={() => void handleDialerSync(l)}
                    dialerLoading={syncingId === l.opportunityId}
                  />
                ))}
              </div>
            )}
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
