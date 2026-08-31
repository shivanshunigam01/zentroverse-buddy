import { useState } from "react";
import ModuleShell, { Section } from "@/components/shared/ModuleShell";
import CrmScoreRules from "@/components/modules/crm/CrmScoreRules";
import CrmIntegrations from "@/components/modules/crm/CrmIntegrations";
import type { AppModuleId } from "@/domain/app-nav";

type SettingsTab = "score-rules" | "lead-stages" | "routing" | "integrations";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "score-rules", label: "Score Rules" },
  { id: "lead-stages", label: "Lead Stages" },
  { id: "routing", label: "Routing Rules" },
  { id: "integrations", label: "Integrations" },
];

const Placeholder = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
    <p className="font-semibold">{title}</p>
    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
  </div>
);

const CrmSettings = () => {
  const [tab, setTab] = useState<SettingsTab>("score-rules");

  return (
    <ModuleShell moduleId={"crm-settings" as AppModuleId}>
      <Section title="CRM Settings">
        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/80 hover:bg-secondary/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "score-rules" && <CrmScoreRules />}
        {tab === "lead-stages" && (
          <Placeholder
            title="Lead Stages"
            description="Configurable lead stage management will be available in a future release. Existing stage master and CRM stage transitions remain unchanged."
          />
        )}
        {tab === "routing" && (
          <Placeholder
            title="Routing Rules"
            description="Lead routing and assignment rules will be configured here. Use CRM assign actions until routing automation is available."
          />
        )}
        {tab === "integrations" && <CrmIntegrations />}
      </Section>
    </ModuleShell>
  );
};

export default CrmSettings;
