import { useState } from "react";
import ModuleShell, { Btn, Section, FilterChips, DataTable } from "@/components/shared/ModuleShell";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import MoveStageDialog from "@/components/shared/MoveStageDialog";
import { MOCK_LEADS, type Lead } from "@/domain/leads";
import { Phone, MessageCircle, Eye, ArrowRightLeft } from "lucide-react";

type Props = { onViewLead: (leadId: string) => void };

const FILTERS = ["All", "Stage", "Owner", "Priority", "Hot/Warm/Cold", "Source", "SLA Missed", "Today Follow-up"];

const LeadInbox = ({ onViewLead }: Props) => {
  const [moveLead, setMoveLead] = useState<Lead | null>(null);
  const [filter, setFilter] = useState("All");

  return (
    <ModuleShell moduleId="lead-inbox">
      <Section title="Filters">
        <FilterChips items={FILTERS} active={filter} onSelect={setFilter} />
      </Section>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {MOCK_LEADS.map((l) => (
          <div key={l.leadId} className="space-y-2">
            <LeadCardStrip lead={l} onClick={() => onViewLead(l.leadId)} />
            <div className="flex flex-wrap gap-2 px-1">
              <IconBtn icon={Eye} label="View" onClick={() => onViewLead(l.leadId)} />
              <IconBtn icon={ArrowRightLeft} label="Move" onClick={() => setMoveLead(l)} />
              <IconBtn icon={Phone} label="Call" />
              <IconBtn icon={MessageCircle} label="WA" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <DataTable minWidth={1100}>
        <thead>
          <tr className="border-b bg-secondary/40 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {["Lead ID", "Customer", "Mobile", "Product", "Stage", "Score", "Owner", "Action", "SLA", "Status", "Actions"].map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_LEADS.map((l) => (
            <tr key={l.leadId} className="border-b border-border/50 transition-colors hover:bg-secondary/25">
              <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">{l.leadId}</td>
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
                <div className="flex gap-1">
                  <MiniBtn onClick={() => onViewLead(l.leadId)}>View</MiniBtn>
                  <MiniBtn onClick={() => setMoveLead(l)}>Move</MiniBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      {moveLead && (
        <MoveStageDialog open lead={moveLead} onClose={() => setMoveLead(null)} onConfirm={() => setMoveLead(null)} />
      )}
    </ModuleShell>
  );
};

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
