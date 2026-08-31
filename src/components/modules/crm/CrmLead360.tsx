import { useEffect, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Section } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { fetchCrmLead360, crmAssignLead, crmChangeStage, crmQualifyLead, crmDisqualifyLead, crmRecalculateScore, crmCreateFollowup, crmKeepSeparate, crmLinkDuplicate, crmMergeDuplicate } from "@/api/crm.api";
import { useCrmStore } from "@/store/crm-store";
import { ApiClientError } from "@/lib/api";
import type { AppModuleId } from "@/domain/app-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CrmLeadAttributionPanel from "@/components/modules/crm/CrmLeadAttribution";

type Props = {
  leadId?: string;
};

const MetaItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
    <p className="mt-0.5 font-semibold leading-snug text-foreground">{value}</p>
  </div>
);

const CrmLead360 = ({ leadId }: Props) => {
  const { selectedLeadId, lead360, setLead360, setLoading, loading, setError } = useCrmStore();
  const resolvedId = leadId ?? selectedLeadId ?? undefined;
  const [assignOwner, setAssignOwner] = useState("");
  const [stageTarget, setStageTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [followupAt, setFollowupAt] = useState("");
  const [followupType, setFollowupType] = useState("CALL");
  const [disqualifyReason, setDisqualifyReason] = useState("");
  const [mergeTarget, setMergeTarget] = useState("");

  const refresh = async () => {
    if (!resolvedId) return;
    const refreshed = await fetchCrmLead360(resolvedId);
    setLead360(refreshed);
  };

  useEffect(() => {
    if (!resolvedId) {
      setLead360(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCrmLead360(resolvedId);
        if (!cancelled) {
          setLead360(data);
          setAssignOwner(data.lead.current_owner);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiClientError ? e.message : "Failed to load lead");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedId, setError, setLead360, setLoading]);

  if (!resolvedId) {
    return (
      <ModuleShell moduleId={"crm-lead-detail" as AppModuleId}>
        <EmptyState title="Select a lead" description="Open CRM Leads and choose a lead to view Lead 360." />
      </ModuleShell>
    );
  }

  if (loading && !lead360) {
    return (
      <ModuleShell moduleId={"crm-lead-detail" as AppModuleId}>
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">Loading Lead 360…</div>
      </ModuleShell>
    );
  }

  if (!lead360) {
    return (
      <ModuleShell moduleId={"crm-lead-detail" as AppModuleId}>
        <EmptyState title="Lead not found" description="This lead may belong to another tenant or was removed." />
      </ModuleShell>
    );
  }

  const { lead, customer, stage_history, activities, communications, assignment_history, followups, scoring, duplicates, attribution } = lead360;

  const handleAssign = async () => {
    if (!assignOwner.trim()) return;
    setBusy(true);
    try {
      await crmAssignLead(lead.opportunity_id, { new_owner: assignOwner.trim(), reason: "CRM reassignment" });
      toast.success("Lead assigned");
      await refresh();
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : "Assignment failed");
    } finally {
      setBusy(false);
    }
  };

  const handleStage = async () => {
    if (!stageTarget.trim()) return;
    setBusy(true);
    try {
      await crmChangeStage(lead.opportunity_id, { new_micro_stage: stageTarget.trim(), reason: "CRM stage change" });
      toast.success("Stage updated");
      await refresh();
      setStageTarget("");
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : "Stage change failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModuleShell moduleId={"crm-lead-detail" as AppModuleId}>
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Lead 360</p>
            <h2 className="text-xl font-bold">{lead.customer_name ?? lead.lead_id}</h2>
            <p className="text-sm text-muted-foreground">{lead.lead_id} · {lead.product}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {lead.current_micro_stage}
            </span>
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700">
              {lead.score_classification ?? "Cold"}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{lead.status}</span>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem label="Owner" value={lead.current_owner} />
          <MetaItem label="Source" value={lead.source} />
          <MetaItem label="Campaign" value={lead.campaign ?? "—"} />
          <MetaItem label="Qualification" value={lead.qualification_status ?? "—"} />
          <MetaItem label="Temperature" value={lead.temperature ?? scoring?.temperature ?? "—"} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="qualification">Qualification</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Section title="Customer">
            {customer ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <MetaItem label="Name" value={String(customer.name ?? "—")} />
                <MetaItem label="Mobile" value={String(customer.mobile ?? "—")} />
                <MetaItem label="Email" value={String(customer.email ?? "—")} />
                <MetaItem label="City" value={String(customer.city ?? "—")} />
                <MetaItem label="Customer ID" value={String(customer.customer_id ?? "—")} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No customer record linked.</p>
            )}
          </Section>
          <Section title="Lead">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <MetaItem label="Opportunity ID" value={lead.opportunity_id} />
              <MetaItem label="Product" value={lead.product} />
              <MetaItem label="Variant" value={lead.variant ?? "—"} />
              <MetaItem label="Lead score" value={String(lead.lead_score ?? 0)} />
              <MetaItem label="Branch" value={String((lead as Record<string, unknown>).branch ?? "—")} />
            </div>
          </Section>
          <Section title="Stage journey">
            <div className="space-y-2">
              {stage_history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stage history yet.</p>
              ) : (
                stage_history.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">
                      {h.from_micro_stage ? `${String(h.from_micro_stage)} → ` : ""}
                      {String(h.to_micro_stage)}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span>{String(h.changed_by ?? "System")}</span>
                    {h.created_at ? (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(String(h.created_at)).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="timeline">
          <Section title="Activity timeline">
            <div className="space-y-2">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activities recorded.</p>
              ) : (
                activities.map((a, i) => (
                  <div key={i} className="rounded-lg border border-border/50 px-3 py-2">
                    <p className="text-sm font-semibold">{String(a.title ?? a.type)}</p>
                    {a.description ? <p className="text-xs text-muted-foreground">{String(a.description)}</p> : null}
                    {a.created_at ? (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(String(a.created_at)).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Section>
          {assignment_history.length > 0 && (
            <Section title="Assignment history">
              <div className="space-y-2">
                {assignment_history.map((a, i) => (
                  <div key={i} className="rounded-lg border border-border/50 px-3 py-2 text-sm">
                    {String(a.previous_owner ?? "—")} → <strong>{String(a.new_owner)}</strong>
                    <span className="ml-2 text-xs text-muted-foreground">by {String(a.assigned_by)}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </TabsContent>

        <TabsContent value="communications">
          <Section title="Communication history">
            {communications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No communications logged yet.</p>
            ) : (
              <div className="space-y-2">
                {communications.map((c, i) => (
                  <div key={i} className="rounded-lg border border-border/50 px-3 py-2 text-sm">
                    <span className="font-semibold">{String(c.channel ?? "Channel")}</span>
                    <span className="text-muted-foreground"> · {String(c.direction ?? "")}</span>
                    {c.message ? <p className="mt-1 text-xs">{String(c.message)}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="followups" className="space-y-4">
          <Section title="Schedule follow-up">
            <div className="flex flex-wrap gap-2">
              <input type="datetime-local" value={followupAt} onChange={(e) => setFollowupAt(e.target.value)} className="input-app" />
              <select value={followupType} onChange={(e) => setFollowupType(e.target.value)} className="input-app">
                <option value="CALL">Call</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="EMAIL">Email</option>
                <option value="VISIT">Visit</option>
              </select>
              <button
                type="button"
                disabled={busy || !followupAt}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await crmCreateFollowup(lead.opportunity_id, {
                      scheduled_at: new Date(followupAt).toISOString(),
                      followup_type: followupType,
                    });
                    toast.success("Follow-up scheduled");
                    setFollowupAt("");
                    await refresh();
                  } catch (e) {
                    toast.error(e instanceof ApiClientError ? e.message : "Failed to schedule");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </Section>
          <Section title="Follow-up history">
            {followups?.length ? (
              <div className="space-y-2">
                {followups.map((f) => (
                  <div key={f.followup_id} className="rounded-lg border border-border/50 px-3 py-2 text-sm">
                    <strong>{f.followup_type}</strong> · {f.status} · {new Date(f.scheduled_at).toLocaleString()}
                    {f.remarks ? <p className="text-xs text-muted-foreground">{f.remarks}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No follow-ups yet.</p>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="qualification" className="space-y-4">
          <Section title="Qualification status">
            <p className="mb-3 text-sm">Current: <strong>{lead.qualification_status ?? "Not set"}</strong></p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await crmQualifyLead(lead.opportunity_id);
                    toast.success("Lead qualified");
                    await refresh();
                  } catch (e) {
                    toast.error(e instanceof ApiClientError ? e.message : "Qualify failed");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Qualify
              </button>
              <input
                type="text"
                value={disqualifyReason}
                onChange={(e) => setDisqualifyReason(e.target.value)}
                placeholder="Disqualify reason"
                className="input-app min-w-[200px] flex-1"
              />
              <button
                type="button"
                disabled={busy || !disqualifyReason.trim()}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await crmDisqualifyLead(lead.opportunity_id, disqualifyReason.trim());
                    toast.success("Lead disqualified");
                    await refresh();
                  } catch (e) {
                    toast.error(e instanceof ApiClientError ? e.message : "Disqualify failed");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                Disqualify
              </button>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <Section title="Lead score">
            <p className="text-sm">
              Score: <strong>{scoring?.lead_score ?? lead.lead_score ?? 0}</strong> ·{" "}
              {scoring?.score_classification ?? lead.score_classification ?? "Cold"} · v{scoring?.score_version ?? 1}
            </p>
            {scoring?.score_reasons?.length ? (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {scoring.score_reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No score reasons yet — recalculate to apply rules.</p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await crmRecalculateScore(lead.opportunity_id);
                  toast.success("Score recalculated");
                  await refresh();
                } catch (e) {
                  toast.error(e instanceof ApiClientError ? e.message : "Score recalculation failed");
                } finally {
                  setBusy(false);
                }
              }}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Recalculate score
            </button>
          </Section>
          {scoring?.ledger?.length ? (
            <Section title="Score ledger">
              <div className="space-y-2">
                {scoring.ledger.map((entry, i) => (
                  <div key={i} className="rounded-lg border border-border/50 px-3 py-2 text-xs">
                    {String(entry.event_type)} · +{String(entry.points)} → {String(entry.score_after)} ({String(entry.classification_after)})
                  </div>
                ))}
              </div>
            </Section>
          ) : null}
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <Section title="Duplicate review">
            <p className="text-sm text-muted-foreground">
              Status: {duplicates?.duplicate_status ?? lead.duplicate_status ?? "NEW"} · Window: {duplicates?.window_days ?? 30} days
            </p>
            {duplicates?.candidates?.length ? (
              <div className="mt-3 space-y-2">
                {duplicates.candidates.map((c) => (
                  <div key={c.opportunity_id} className="rounded-lg border border-border/50 px-3 py-2 text-sm">
                    <strong>{c.lead_id}</strong> · {c.product} · {c.duplicate_classification}
                    <p className="text-xs text-muted-foreground">{c.customer_name} · {c.current_owner}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No duplicate candidates found.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                type="text"
                value={mergeTarget}
                onChange={(e) => setMergeTarget(e.target.value)}
                placeholder="Target opportunity_id"
                className="input-app min-w-[220px] flex-1"
              />
              <button
                type="button"
                disabled={busy || !mergeTarget.trim()}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await crmLinkDuplicate(lead.opportunity_id, mergeTarget.trim());
                    toast.success("Leads linked");
                    await refresh();
                  } catch (e) {
                    toast.error(e instanceof ApiClientError ? e.message : "Link failed");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="rounded-lg border px-3 py-2 text-xs font-semibold"
              >
                Link
              </button>
              <button
                type="button"
                disabled={busy || !mergeTarget.trim()}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await crmMergeDuplicate(lead.opportunity_id, mergeTarget.trim());
                    toast.success("Duplicate merged");
                    await refresh();
                  } catch (e) {
                    toast.error(e instanceof ApiClientError ? e.message : "Merge failed");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="rounded-lg border px-3 py-2 text-xs font-semibold"
              >
                Merge
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await crmKeepSeparate(lead.opportunity_id);
                    toast.success("Marked as separate");
                    await refresh();
                  } catch (e) {
                    toast.error(e instanceof ApiClientError ? e.message : "Action failed");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="rounded-lg border px-3 py-2 text-xs font-semibold"
              >
                Keep separate
              </button>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="attribution">
          <Section title="Lead attribution">
            <CrmLeadAttributionPanel attribution={attribution} />
          </Section>
        </TabsContent>

        <TabsContent value="actions">
          <Section title="Assign lead">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={assignOwner}
                onChange={(e) => setAssignOwner(e.target.value)}
                className="input-app min-w-[200px] flex-1"
                placeholder="New owner name"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleAssign}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </Section>
          <Section title="Change stage">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={stageTarget}
                onChange={(e) => setStageTarget(e.target.value)}
                className="input-app min-w-[200px] flex-1"
                placeholder="e.g. C0.2"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleStage}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary/60 disabled:opacity-50"
              >
                Update stage
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Sequential stage rules apply. Use the existing Lead Detail module for guided stage journey.
            </p>
          </Section>
        </TabsContent>
      </Tabs>
    </ModuleShell>
  );
};

export default CrmLead360;
