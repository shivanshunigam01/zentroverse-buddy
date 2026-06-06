import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Btn, Section } from "@/components/shared/ModuleShell";
import type { Lead } from "@/adapters/lead-view.adapter";
import type { CustomerMaster } from "@/domain/entities/customer";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import {
  STAGE_SELECT_GROUPS,
  formatStageOptionLabel,
} from "@/domain/stages/business-stages";
import { manualEditLead } from "@/api/opportunities.api";
import { getCurrentUserName } from "@/api/auth.api";
import { ApiClientError } from "@/lib/api";
import { getZentroFlowStore } from "@/store/opportunity-store";
import { refreshOpportunity } from "@/services/sync.service";

type Props = {
  lead: Lead;
  opportunity: OpportunityMaster;
  customer?: CustomerMaster;
};

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LeadManualEditForm({ lead, opportunity, customer }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    const str = (key: string) => String(fd.get(key) ?? "").trim();

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        changed_by: getCurrentUserName(),
        new_micro_stage: str("new_micro_stage"),
        stage_reason: str("stage_reason") || "Manual edit from lead detail form",
        customer_name: str("customer_name"),
        customer_mobile: str("customer_mobile"),
        customer_email: str("customer_email"),
        customer_address: str("customer_address"),
        product: str("product"),
        variant: str("variant"),
        requirement: str("requirement"),
        source: str("source"),
        campaign: str("campaign"),
        branch: str("branch"),
        current_owner: str("current_owner"),
        escalation_owner: str("escalation_owner"),
        current_action: str("current_action"),
        next_action: str("next_action"),
        priority: str("priority"),
        status: str("status"),
        score_classification: str("score_classification"),
        sla: str("sla"),
        sla_status: str("sla_status"),
        lead_score: Number(str("lead_score") || opportunity.lead_score),
      };

      const nextAt = str("next_action_date");
      const slaDue = str("sla_due_at");
      if (nextAt) body.next_action_date = new Date(nextAt).toISOString();
      if (slaDue) body.sla_due_at = new Date(slaDue).toISOString();

      const opp = await manualEditLead(lead.opportunityId, body);
      const store = getZentroFlowStore();
      store.upsertOpportunity(opp);

      if (customer) {
        store.upsertCustomer({
          ...customer,
          name: str("customer_name") || customer.name,
          mobile: str("customer_mobile") || customer.mobile,
          email: str("customer_email") || customer.email || null,
          address: str("customer_address") || customer.address || null,
        });
      }

      await refreshOpportunity(lead.opportunityId).catch(() => undefined);
      toast.success("Lead updated", { description: "Changes saved to database." });
    } catch (err) {
      toast.error("Save failed", {
        description: err instanceof ApiClientError ? err.message : "Could not update lead",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Manual update — save to database">
      <p className="mb-4 text-sm text-muted-foreground">
        Edit any field below and save. Same fields as Move Stage, plus customer and pipeline
        details. Automatic step rules can be added later.
      </p>

      <form ref={formRef} onSubmit={(e) => void handleSubmit(e)} className="space-y-6 text-sm">
        <FormBlock title="Customer">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="customer_name" label="Customer name" defaultValue={lead.customerName} required />
            <Field name="customer_mobile" label="Mobile" defaultValue={lead.mobile} required />
            <Field name="customer_email" label="Email" defaultValue={customer?.email ?? lead.email ?? ""} />
            <Field name="customer_address" label="Address" defaultValue={customer?.address ?? ""} />
          </div>
        </FormBlock>

        <FormBlock title="Stage & actions">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnly label="Current stage" value={`${lead.currentStage} · ${lead.microStage}`} />
            <StageSelect name="new_micro_stage" label="Micro stage" defaultCode={opportunity.current_micro_stage} />
            <Field name="stage_reason" label="Stage change reason" placeholder="Required if stage changes" />
            <Field name="current_action" label="Current action" defaultValue={lead.currentAction} required />
            <Field name="next_action" label="Next action" defaultValue={lead.nextAction} required />
            <Field
              name="next_action_date"
              label="Next action date"
              type="datetime-local"
              defaultValue={toDatetimeLocal(opportunity.next_action_date)}
            />
            <Field name="current_owner" label="Owner" defaultValue={lead.currentOwner} required />
            <Field name="escalation_owner" label="Escalation owner" defaultValue={lead.escalationOwner} required />
          </div>
        </FormBlock>

        <FormBlock title="Opportunity">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="product" label="Product" defaultValue={lead.product} required />
            <Field name="variant" label="Variant" defaultValue={opportunity.variant ?? ""} />
            <Field name="requirement" label="Requirement" defaultValue={opportunity.requirement ?? ""} />
            <Field name="source" label="Source" defaultValue={lead.source} />
            <Field name="campaign" label="Campaign" defaultValue={lead.campaign ?? ""} />
            <Field name="branch" label="Branch" defaultValue={lead.branch} />
          </div>
        </FormBlock>

        <FormBlock title="Score & SLA">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="lead_score" label="Lead score" type="number" defaultValue={String(lead.leadScore)} />
            <SelectField
              name="score_classification"
              label="Score band"
              defaultValue={lead.scoreLabel}
              options={["Cold", "Warm", "Hot", "Critical"]}
            />
            <SelectField
              name="priority"
              label="Priority"
              defaultValue={lead.priority}
              options={["P1", "P2", "P3", "P4", "P5"]}
            />
            <SelectField
              name="status"
              label="Status"
              defaultValue={lead.status}
              options={["Open", "Hold", "Lost", "Delivered", "Closed"]}
            />
            <Field name="sla" label="SLA label" defaultValue={lead.slaTime} />
            <Field
              name="sla_due_at"
              label="SLA due"
              type="datetime-local"
              defaultValue={toDatetimeLocal(opportunity.sla_due_at)}
            />
            <SelectField
              name="sla_status"
              label="SLA status"
              defaultValue={opportunity.sla_status}
              options={["On Track", "At Risk", "Breached"]}
            />
          </div>
        </FormBlock>

        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Btn type="submit" disabled={saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </span>
            ) : (
              "Save to database"
            )}
          </Btn>
        </div>
      </form>
    </Section>
  );
}

function FormBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[10px] font-bold uppercase text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="input-app mt-1.5 w-full px-3 py-2.5 text-sm"
      />
    </div>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
  required,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[10px] font-bold uppercase text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="input-app mt-1.5 w-full px-3 py-2.5 text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function StageSelect({
  name,
  label,
  defaultCode,
}: {
  name: string;
  label: string;
  defaultCode: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[10px] font-bold uppercase text-muted-foreground">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultCode}
        className="input-app mt-1.5 w-full px-3 py-2.5 text-sm"
      >
        {STAGE_SELECT_GROUPS.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.stages.map((stage) => (
              <option key={stage.code} value={stage.code}>
                {formatStageOptionLabel(stage)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
