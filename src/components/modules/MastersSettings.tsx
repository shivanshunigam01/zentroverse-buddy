import ModuleShell, { Btn, Section } from "@/components/shared/ModuleShell";
import { DATABASE_TABLES } from "@/domain/platform";

const MastersSettings = () => (
  <ModuleShell moduleId="masters">
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Masters">
        <ul className="space-y-2 text-sm">
          {["Branches", "Executives", "Products & variants", "Lead sources", "Campaigns", "Territories", "Objection scripts", "Lost reasons"].map((m) => (
            <li key={m} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              {m}
              <Btn variant="outline">Manage</Btn>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Settings">
        <ul className="space-y-2 text-sm">
          {["SLA defaults", "Dialer retry rules", "WhatsApp templates", "Scoring rules", "Duplicate window (30 days)", "Working hours", "DND / opt-out"].map((s) => (
            <li key={s} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              {s}
              <Btn variant="outline">Configure</Btn>
            </li>
          ))}
        </ul>
      </Section>
    </div>

    <Section title="Database tables (backend reference)">
      <div className="flex flex-wrap gap-1.5">
        {DATABASE_TABLES.map((t) => (
          <span key={t} className="rounded-md bg-secondary font-mono text-[10px] px-2 py-1">{t}</span>
        ))}
      </div>
    </Section>
  </ModuleShell>
);

export default MastersSettings;
