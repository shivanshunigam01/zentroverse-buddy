import { useMemo, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Section, FilterChips, DataTable, Btn, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import MoveStageDialog from "@/components/shared/MoveStageDialog";
import type { Lead } from "@/adapters/lead-view.adapter";
import { useOpportunityLeads } from "@/store/selectors";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { Phone, MessageCircle, Eye, ArrowRightLeft } from "lucide-react";

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
        <>
      <Section title="Filters">
        <FilterChips items={FILTERS} active={filter} onSelect={onFilterSelect} />
        {filter !== "All" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Showing {leads.length} of {allLeads.length} leads
          </p>
        )}
      </Section>

      <div className="space-y-3 md:hidden">
        {leads.map((l) => (
          <div key={l.leadId} className="space-y-2">
            <LeadCardStrip lead={l} onClick={() => viewLead(l.opportunityId)} />
            <div className="flex flex-wrap gap-2 px-1">
              <IconBtn icon={Eye} label="View" onClick={() => viewLead(l.opportunityId)} />
              <IconBtn icon={ArrowRightLeft} label="Move" onClick={() => setMoveLead(l)} />
              <IconBtn icon={Phone} label="Call" onClick={() => callLead(l.mobile, l.customerName)} />
              <IconBtn icon={MessageCircle} label="WA" onClick={() => openWhatsApp(l.opportunityId)} />
            </div>
          </div>
        ))}
        {leads.length === 0 && <EmptyInbox />}
      </div>

      <DataTable minWidth={1400}>
        <thead>
          <tr className="border-b bg-secondary/40 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
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
              <th key={h} className="whitespace-nowrap px-3 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.leadId} className="border-b border-border/50 transition-colors hover:bg-secondary/25">
              <td className="whitespace-nowrap px-3 py-3">
                <p className="text-[9px] font-bold uppercase text-muted-foreground md:sr-only">Lead ID</p>
                <span className="font-mono text-xs">{l.leadId}</span>
              </td>
              <td className="whitespace-nowrap px-3 py-3">
                <p className="text-[9px] font-bold uppercase text-muted-foreground md:sr-only">Customer ID</p>
                <span className="font-mono text-xs text-muted-foreground">{l.customerId}</span>
              </td>
              <td className="whitespace-nowrap px-3 py-3">
                <p className="text-[9px] font-bold uppercase text-muted-foreground md:sr-only">Opportunity ID</p>
                <span className="font-mono text-xs text-muted-foreground">{l.opportunityId}</span>
              </td>
              <td className="px-3 py-3 font-semibold">{l.customerName}</td>
              <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">{l.mobile}</td>
              <td className="px-3 py-3 text-xs">{l.product}</td>
              <td className="px-3 py-3">
                <span className="font-mono text-xs font-bold text-primary">{l.currentStage}</span>
                <p className="max-w-[140px] truncate text-[10px] text-muted-foreground">{l.microStage}</p>
              </td>
              <td className="px-3 py-3 text-xs font-semibold">{l.leadScore} {l.scoreLabel}</td>
              <td className="px-3 py-3 text-xs">{l.currentOwner}</td>
              <td className="max-w-[140px] truncate px-3 py-3 text-xs">{l.currentAction}</td>
              <td className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${l.slaCountdown === "Overdue" ? "text-destructive" : ""}`}>
                {l.slaTime}
              </td>
              <td className="px-3 py-3 text-xs">{l.status}</td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1">
                  <MiniBtn onClick={() => viewLead(l.opportunityId)}>View</MiniBtn>
                  <MiniBtn onClick={() => setMoveLead(l)}>Move</MiniBtn>
                  <MiniBtn onClick={() => callLead(l.mobile, l.customerName)}>Call</MiniBtn>
                  <MiniBtn onClick={() => openWhatsApp(l.opportunityId)}>WA</MiniBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      {leads.length === 0 && <div className="hidden md:block"><EmptyInbox /></div>}

      {moveLead && (
        <MoveStageDialog open lead={moveLead} onClose={() => setMoveLead(null)} onConfirm={() => setMoveLead(null)} />
      )}
        </>
      )}
    </ModuleShell>
  );
};

const EmptyInbox = () => (
  <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
    No leads match this filter.
  </p>
);

const MiniBtn = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button type="button" onClick={onClick} className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/20">
    {children}
  </button>
);

const IconBtn = ({ icon: Icon, label, onClick }: { icon: typeof Eye; label: string; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-card text-xs font-semibold sm:flex-none sm:px-4"
  >
    <Icon size={14} />
    {label}
  </button>
);

export default LeadInbox;
