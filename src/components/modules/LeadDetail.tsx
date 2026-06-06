import { useEffect, useState } from "react";
import { refreshOpportunity } from "@/services/sync.service";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import LeadIdentityTable from "@/components/shared/LeadIdentityTable";
import { LeadManualEditForm } from "@/components/shared/LeadManualEditForm";
import { LeadStageJourney } from "@/components/shared/LeadStageJourney";
import { SCORING_RULES } from "@/domain/platform";
import { buildStatusGridFromStep } from "@/domain/stages/c0-stage-fields";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import { useLeadById, useOpportunityLeads, useActivitiesForOpportunity, useCustomer } from "@/store/selectors";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useOpportunityActions } from "@/hooks/use-opportunity-actions";
import { getNextMicroStage } from "@/domain/stages/stage-gates";
import { useZentroFlowStore } from "@/store/opportunity-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = { leadId?: string };

const DETAIL_TABS = [
  "Overview", "Activity Timeline", "Contact Health", "Engagement", "Qualification",
  "Quote", "Finance", "Booking", "Delivery", "Lifecycle", "Documents", "Notes",
] as const;

const MetaItem = ({
  label,
  value,
  highlight,
  className = "",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) => (
  <div className={className}>
    <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
    <p className={`mt-0.5 font-semibold leading-snug ${highlight ? "text-warning" : "text-foreground"}`}>{value}</p>
  </div>
);

const LeadDetail = ({ leadId }: Props) => {
  const leads = useOpportunityLeads();
  const resolved = useLeadById(leadId);
  const lead = resolved ?? leads[0];
  const opp = useZentroFlowStore((s) => (lead ? s.opportunities[lead.opportunityId] : undefined));
  const customer = useCustomer(lead?.customerId ?? "");
  const nextStep = opp ? getNextMicroStage(opp) : null;
  const [tab, setTab] = useState<string>("Overview");
  const { callLead, openWhatsApp } = useDashboardActions();
  const { run } = useOpportunityActions(lead?.opportunityId);

  useEffect(() => {
    if (!lead?.opportunityId) return;
    void refreshOpportunity(lead.opportunityId);
  }, [lead?.opportunityId]);

  if (!lead) {
    return (
      <ModuleShell moduleId="lead-detail">
        <EmptyState
          title="No lead selected"
          description="Upload Excel leads first, then open a lead from the inbox to work through C0 → C3 step by step."
        />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell moduleId="lead-detail">
      {nextStep && (
        <p className="rounded-xl bg-primary/5 px-4 py-2 text-sm text-primary">
          Next step: <strong>{nextStep}</strong> — only the matching action button is enabled.
        </p>
      )}
      {/* Top header */}
      <div className="surface-card overflow-hidden p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:gap-6">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{lead.customerName}</h2>
            <a href={`tel:${lead.mobile}`} className="mt-1 inline-block text-sm font-medium text-primary hover:underline">
              {lead.mobile}
            </a>
            <div className="mt-3 max-w-md">
              <LeadIdentityTable lead={lead} compact />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary/40 p-3 text-xs sm:gap-3 sm:p-4 sm:text-sm lg:min-w-[240px]">
            <MetaItem label="Product" value={lead.product} />
            <MetaItem label="Score" value={`${lead.leadScore} ${lead.scoreLabel}`} />
            <MetaItem label="Priority" value={lead.priority} />
            <MetaItem label="Owner" value={lead.currentOwner} />
            <MetaItem label="Stage" value={`${lead.currentStage} · ${lead.microStage}`} className="col-span-2" />
            <MetaItem label="SLA" value={lead.slaCountdown ?? lead.slaTime} highlight className="col-span-2" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Btn onClick={() => callLead(lead.mobile, lead.customerName)}>Call Customer</Btn>
          <Btn variant="outline" onClick={() => openWhatsApp(lead.opportunityId)}>
            WhatsApp
          </Btn>
        </div>
        <div className="mt-3">
          <LeadCardStrip lead={lead} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="min-w-0">
        <div className="tabs-scroll rounded-xl bg-secondary/50 p-1.5">
          <TabsList className="inline-flex h-auto min-w-max gap-1 bg-transparent p-0">
            {DETAIL_TABS.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-sm"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="Overview" className="mt-4 space-y-4">
          {opp && <LeadStageJourney lead={lead} opportunity={opp} customer={customer} />}
          {opp && (
            <details className="rounded-2xl border border-border/60 bg-secondary/10 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">
                Advanced — edit all database fields
              </summary>
              <div className="mt-4">
                <LeadManualEditForm lead={lead} opportunity={opp} customer={customer} />
              </div>
            </details>
          )}
          <OverviewTab lead={lead} opp={opp} />
        </TabsContent>
        <TabsContent value="Activity Timeline" className="mt-4">
          <TimelineTab leadId={lead.opportunityId} />
        </TabsContent>
        <TabsContent value="Contact Health" className="mt-4">
          <ContactHealthTab opp={opp} run={run} />
        </TabsContent>
        <TabsContent value="Engagement" className="mt-4">
          <EngagementTab opp={opp} run={run} />
        </TabsContent>
        <TabsContent value="Qualification" className="mt-4">
          <QualificationTab opp={opp} run={run} />
        </TabsContent>
        <TabsContent value="Quote" className="mt-4">
          <QuoteTab run={run} />
        </TabsContent>
        <TabsContent value="Finance" className="mt-4">
          <FinanceTab run={run} />
        </TabsContent>
        <TabsContent value="Booking" className="mt-4">
          <BookingTab run={run} />
        </TabsContent>
        <TabsContent value="Delivery" className="mt-4">
          <DeliveryTab run={run} />
        </TabsContent>
        <TabsContent value="Lifecycle" className="mt-4">
          <LifecycleTab run={run} />
        </TabsContent>
        <TabsContent value="Documents" className="mt-4">
          <Section title="Documents"><Btn onClick={() => run("Upload Document")}>Upload Document</Btn></Section>
        </TabsContent>
        <TabsContent value="Notes" className="mt-4">
          <Section title="Notes"><textarea className="input-app min-h-[120px] w-full" placeholder="Add note..." /></Section>
        </TabsContent>
      </Tabs>
    </ModuleShell>
  );
};

const OverviewTab = ({ lead, opp }: { lead: import("@/adapters/lead-view.adapter").Lead; opp?: OpportunityMaster }) => {
  const c08 = opp?.stage_step_data?.["C0.8"]?.fields;
  const scoreFromForm = c08?.calculated_score != null ? String(c08.calculated_score) : null;
  const labelFromForm = c08?.score_output != null ? String(c08.score_output) : null;

  return (
    <>
      <Section title="Lead identity">
        <LeadIdentityTable lead={lead} />
      </Section>
      <Section title="Scoring reference (C0.8)">
        <p className="mb-3 text-sm text-muted-foreground">
          Enter scoring signals in the stage journey on Overview. Reference point values:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SCORING_RULES.map((r) => (
            <div key={r.activity} className="flex justify-between rounded-lg bg-secondary/30 px-3 py-2 text-sm">
              <span>{r.activity}</span>
              <span className="font-mono font-bold">{r.points > 0 ? `+${r.points}` : r.points}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-lg font-bold">
          Current output: {labelFromForm ?? lead.scoreLabel} ({scoreFromForm ?? lead.leadScore})
        </p>
      </Section>
    </>
  );
};

const ContactHealthTab = ({ opp, run }: { opp?: OpportunityMaster; run: (label: string) => void }) => {
  const c03 = buildStatusGridFromStep("C0.3", opp?.stage_step_data?.["C0.3"]?.fields);
  const c02 = buildStatusGridFromStep("C0.2", opp?.stage_step_data?.["C0.2"]?.fields);

  return (
    <div className="space-y-4">
      <Section title="C0.3 · Contact health">
        {c03.length > 0 ? (
          <StatusGrid items={c03} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No contact health data yet — fill C0.3 in the Overview stage journey.
          </p>
        )}
        <ActionBar>
          <Btn onClick={() => run("Verify Number")}>Verify Number</Btn>
          <Btn variant="outline" onClick={() => run("Check WhatsApp")}>Check WhatsApp</Btn>
          <Btn variant="outline" onClick={() => run("Send Test Message")}>Send Test Message</Btn>
          <Btn variant="secondary" onClick={() => run("Move to Bot")}>Move to Bot</Btn>
          <Btn variant="secondary" onClick={() => run("Move to Dialer")}>Move to Dialer</Btn>
          <Btn variant="danger" onClick={() => run("Mark Invalid")}>Mark Invalid</Btn>
        </ActionBar>
      </Section>
      <Section title="C0.2 · Duplicate check">
        {c02.length > 0 ? (
          <StatusGrid items={c02} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No duplicate check data yet — fill C0.2 in the Overview stage journey.
          </p>
        )}
        <ActionBar>
          <Btn variant="secondary" onClick={() => run("Merge Lead")}>Merge Lead</Btn>
          <Btn variant="secondary" onClick={() => run("New Opportunity")}>New Opportunity</Btn>
          <Btn variant="secondary" onClick={() => run("Reopen Old Lead")}>Reopen Old Lead</Btn>
          <Btn variant="outline" onClick={() => run("Alert Manager")}>Alert Manager</Btn>
        </ActionBar>
      </Section>
    </div>
  );
};

const EngagementTab = ({ opp, run }: { opp?: OpportunityMaster; run: (label: string) => void }) => {
  const c04 = buildStatusGridFromStep("C0.4", opp?.stage_step_data?.["C0.4"]?.fields);
  const c05 = buildStatusGridFromStep("C0.5", opp?.stage_step_data?.["C0.5"]?.fields);

  return (
    <div className="space-y-4">
      <Section title="C0.4 · Bot engagement">
        {c04.length > 0 ? (
          <StatusGrid items={c04} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No bot engagement data yet — fill C0.4 in the Overview stage journey.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={() => run("Send Bot Message")}>Send Bot Message</Btn>
          <Btn variant="outline" onClick={() => run("Resend Message")}>Resend Message</Btn>
          <Btn variant="outline" onClick={() => run("View Reply")}>View Reply</Btn>
          <Btn variant="secondary" onClick={() => run("Transfer to Executive")}>Transfer to Executive</Btn>
        </div>
      </Section>
      <Section title="C0.5 · Autodialer / AI call">
        {c05.length > 0 ? (
          <StatusGrid items={c05} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No call data yet — fill C0.5 in the Overview stage journey.
          </p>
        )}
      </Section>
    </div>
  );
};

const QualificationTab = ({ opp, run }: { opp?: OpportunityMaster; run: (label: string) => void }) => {
  const c06 = buildStatusGridFromStep("C0.6", opp?.stage_step_data?.["C0.6"]?.fields);
  const c07 = buildStatusGridFromStep("C0.7", opp?.stage_step_data?.["C0.7"]?.fields);
  const c010 = buildStatusGridFromStep("C0.10", opp?.stage_step_data?.["C0.10"]?.fields);

  return (
    <>
      <Section title="C0.6 · Discovery">
        {c06.length > 0 ? (
          <StatusGrid items={c06} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No discovery data yet — fill C0.6 in the Overview stage journey.
          </p>
        )}
        <ActionBar>
          <Btn onClick={() => run("Save Discovery")}>Save Discovery</Btn>
          <Btn variant="outline" onClick={() => run("Lock Variant")}>Lock Variant</Btn>
          <Btn variant="outline" onClick={() => run("Confirm Budget")}>Confirm Budget</Btn>
        </ActionBar>
      </Section>
      <Section title="C0.7 · Qualification">
        {c07.length > 0 ? (
          <StatusGrid items={c07} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No qualification data yet — fill C0.7 in the Overview stage journey.
          </p>
        )}
        <ActionBar>
          <Btn onClick={() => run("Mark Qualified")}>Mark Qualified</Btn>
          <Btn variant="outline" onClick={() => run("Add Competitor Offer")}>Add Competitor Offer</Btn>
          <Btn variant="outline" onClick={() => run("Schedule Demo")}>Schedule Demo</Btn>
          <Btn variant="outline" onClick={() => run("Confirm Authority")}>Confirm Authority</Btn>
        </ActionBar>
      </Section>
      <Section title="C0.10 · Quote readiness">
        {c010.length > 0 ? (
          <StatusGrid items={c010} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No quote readiness checklist yet — fill C0.10 in the Overview stage journey.
          </p>
        )}
      </Section>
    </>
  );
};

const QuoteTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="C1 · Sales pipeline actions">
    <p className="mb-3 text-xs text-muted-foreground">C1.1 Quote Shared through C1.10 Finance Ready</p>
    <div className="flex flex-wrap gap-2">
      {["Create Quote", "Send Quote", "Capture Objection", "Add Competitor Offer", "Schedule Demo", "Check Affordability", "Start Finance", "Escalate Manager", "Move to Nurture", "Move to C1A"].map((a) => (
        <Btn key={a} variant={a.includes("Move") ? "primary" : "outline"} onClick={() => run(a)}>{a}</Btn>
      ))}
    </div>
  </Section>
);

const FinanceTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="C1A · Finance desk">
    <StageList stages={[
      "Application Submitted",
      "Documents Collected",
      "FI Assigned",
      "Verification Done",
      "Decision Pending / Approved / Rejected",
      "Approval Received",
      "Margin Confirmed",
      "Variant Locked",
      "Add-ons Finalized",
      "Payment / Booking Intent Confirmed",
    ]} />
    <div className="mt-4 flex flex-wrap gap-2">
      {["Upload Docs", "Verify Docs", "Assign FI", "Update FI Result", "Mark Approved", "Mark Rejected", "Alternate Finance", "Confirm Margin", "Move to C2"].map((b) => (
        <Btn key={b} variant="outline" onClick={() => run(b)}>{b}</Btn>
      ))}
    </div>
  </Section>
);

const BookingTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="C2 · Booking & billing">
    <StageList stages={[
      "Booking Done",
      "Vehicle Allocation",
      "Variant Lock",
      "Billing Documents",
      "Disbursement",
      "Down Payment",
      "Insurance",
      "Registration",
      "HSRP",
      "PDI",
    ]} />
    <div className="mt-4 flex flex-wrap gap-2">
      {["Create Booking", "Allocate Vehicle", "Lock Booking Variant", "Upload Billing Docs", "Update Disbursement", "Collect Down Payment", "Create Insurance", "Start Registration", "Update HSRP", "Complete PDI", "Move to C3"].map((b) => (
        <Btn key={b} variant="outline" onClick={() => run(b)}>{b}</Btn>
      ))}
    </div>
  </Section>
);

const DeliveryTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="C3 · Delivery desk">
    <Checklist items={[
      "Final Payment",
      "Insurance Active",
      "Registration Complete",
      "PDI Complete",
      "Vehicle Ready",
      "Delivery Done",
      "Feedback Taken",
      "Photo / Video Testimonial",
      "Referral Asked",
      "Lifecycle Activated",
    ]} />
    <div className="mt-4 flex flex-wrap gap-2">
      {["Confirm Payment", "Verify Insurance", "Verify Registration", "Approve PDI", "Mark Vehicle Ready", "Complete Delivery", "Send Feedback Link", "Capture Testimonial", "Ask Referral", "Activate Lifecycle"].map((b) => (
        <Btn key={b} variant="outline" onClick={() => run(b)}>{b}</Btn>
      ))}
    </div>
  </Section>
);

const LifecycleTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="Lifecycle timeline">
    {["Day 1 Thank You", "Day 3 Feedback", "Day 7 Usage Tips", "Day 30 Service Reminder", "1 Year Renewal", "3 Years Upgrade", "5 Years Exchange"].map((t) => (
      <div key={t} className="flex items-center justify-between border-b border-border/50 py-2 text-sm">
        <span>{t}</span>
        <Btn variant="outline" onClick={() => run("Send Message")}>Send Message</Btn>
      </div>
    ))}
  </Section>
);

const TimelineTab = ({ leadId }: { leadId?: string }) => {
  const activities = useActivitiesForOpportunity(leadId);
  return (
  <Section title="Activity timeline">
    {activities.length === 0 ? (
      <p className="text-sm text-muted-foreground">No activity yet — actions you take will appear here.</p>
    ) : (
      activities.map((e) => (
        <div key={e.activity_id} className="border-l-2 border-primary/30 py-2 pl-4 text-sm">
          {e.remarks}
          <span className="ml-2 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
        </div>
      ))
    )}
  </Section>
  );
};

const StatusGrid = ({ items }: { items: [string, string][] }) => (
  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
    {items.map(([k, v]) => (
      <div key={k} className="rounded-lg bg-secondary/30 px-3 py-2">
        <p className="text-[10px] uppercase text-muted-foreground">{k}</p>
        <p className="font-semibold text-foreground">{v}</p>
      </div>
    ))}
  </div>
);

const Checklist = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li key={item} className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 rounded border-border" />
        {item}
      </li>
    ))}
  </ul>
);

const StageList = ({ stages }: { stages: string[] }) => (
  <ol className="space-y-1 text-sm">
    {stages.map((s, i) => (
      <li key={s} className="flex gap-2 rounded-lg bg-secondary/20 px-3 py-2">
        <span className="font-mono text-xs text-primary">{i + 1}</span>
        {s}
      </li>
    ))}
  </ol>
);

export default LeadDetail;
