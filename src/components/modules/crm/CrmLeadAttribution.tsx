import type { CrmLeadAttribution } from "@/api/crm.api";

type Props = {
  attribution: CrmLeadAttribution | null | undefined;
};

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div>
    <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
    <p className="mt-0.5 text-sm font-medium leading-snug">{value?.trim() ? value : "—"}</p>
  </div>
);

const CrmLeadAttributionPanel = ({ attribution }: Props) => {
  if (!attribution) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
        No attribution data captured yet. Meta and Google attribution will appear here after integration.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Platform-agnostic attribution record. Prepared for Meta Lead Ads and Google Ads without being platform-specific.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Source" value={attribution.source} />
        <Field label="Medium" value={attribution.medium} />
        <Field label="Campaign" value={attribution.campaign} />
        <Field label="Campaign ID" value={attribution.campaign_id} />
        <Field label="Ad ID" value={attribution.ad_id} />
        <Field label="Ad Set ID" value={attribution.ad_set_id} />
        <Field label="Ad Name" value={attribution.ad_name} />
        <Field label="Form ID" value={attribution.form_id} />
        <Field label="External Lead ID" value={attribution.external_lead_id} />
        <Field label="Platform" value={attribution.platform} />
        <Field label="Landing Page" value={attribution.landing_page} />
        <Field label="UTM Source" value={attribution.utm_source} />
        <Field label="UTM Medium" value={attribution.utm_medium} />
        <Field label="UTM Campaign" value={attribution.utm_campaign} />
        <Field label="UTM Content" value={attribution.utm_content} />
        <Field label="UTM Term" value={attribution.utm_term} />
        <Field label="GCLID" value={attribution.gclid} />
        <Field label="FBCLID" value={attribution.fbclid} />
      </div>
      {attribution.captured_at && (
        <p className="text-xs text-muted-foreground">
          Captured: {new Date(attribution.captured_at).toLocaleString()}
          {attribution._derived_from_opportunity ? " (derived from lead record)" : ""}
        </p>
      )}
    </div>
  );
};

export default CrmLeadAttributionPanel;
