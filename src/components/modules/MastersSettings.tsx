import { useEffect, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Btn, Section } from "@/components/shared/ModuleShell";
import { DATABASE_TABLES } from "@/domain/platform";
import { fetchModuleAccess } from "@/api/access.api";
import { listCustomers } from "@/api/customers.api";
import { ApiClientError } from "@/lib/api";

const MastersSettings = () => {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [modules, setModules] = useState<Record<string, { allowed: boolean }> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [access, customers] = await Promise.all([
          fetchModuleAccess(),
          listCustomers(500),
        ]);
        setModules(access);
        setCustomerCount(customers.length);
      } catch (err) {
        toast.error("Could not load settings", {
          description: err instanceof ApiClientError ? err.message : "API error",
        });
      }
    })();
  }, []);

  return (
    <ModuleShell moduleId="masters">
      <Section title="API status">
        <p className="text-sm text-muted-foreground">
          Customers in DB: <strong>{customerCount ?? "…"}</strong> (GET /customers)
        </p>
        {modules && (
          <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
            {Object.entries(modules).map(([key, val]) => (
              <li key={key} className="rounded-md bg-secondary/40 px-2 py-1 font-mono">
                {key}: {val.allowed ? "allowed" : "blocked"}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Masters">
          <ul className="space-y-2 text-sm">
            {["Branches", "Executives", "Products & variants", "Lead sources", "Campaigns", "Territories", "Objection scripts", "Lost reasons"].map((m) => (
              <li key={m} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                {m}
                <Btn variant="outline" onClick={() => toast.info(m, { description: "Master CRUD coming soon on API" })}>
                  Manage
                </Btn>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Settings">
          <ul className="space-y-2 text-sm">
            {["SLA defaults", "Dialer retry rules", "WhatsApp templates", "Scoring rules", "Duplicate window (30 days)", "Working hours", "DND / opt-out"].map((s) => (
              <li key={s} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                {s}
                <Btn variant="outline" onClick={() => toast.info(s, { description: "Configure via server .env for now" })}>
                  Configure
                </Btn>
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
};

export default MastersSettings;
