import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ModuleShell, { Section, StatCard, Btn, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useOpportunityLeads } from "@/store/selectors";

const Reports = () => {
  const { performAction } = useDashboardActions();
  const leads = useOpportunityLeads();

  const execData = useMemo(() => {
    const byOwner: Record<string, { leads: number; hot: number }> = {};
    for (const l of leads) {
      if (!byOwner[l.currentOwner]) byOwner[l.currentOwner] = { leads: 0, hot: 0 };
      byOwner[l.currentOwner].leads++;
      if (l.scoreLabel === "Hot") byOwner[l.currentOwner].hot++;
    }
    return Object.entries(byOwner)
      .map(([name, v]) => ({
        name: name.split(" ")[0] ?? name,
        conv: v.leads > 0 ? Math.round((v.hot / v.leads) * 100) : 0,
        leads: v.leads,
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 8);
  }, [leads]);

  const kpis = useMemo(() => {
    const byStage = { C0: 0, C1: 0, C1A: 0, C2: 0, C3: 0 };
    let slaMissed = 0;
    for (const l of leads) {
      const s = l.currentStage as keyof typeof byStage;
      if (s in byStage) byStage[s]++;
      if (l.slaCountdown === "Overdue") slaMissed++;
    }
    const total = leads.length;
    const delivered = leads.filter((l) => l.status === "Delivered").length;
    return {
      total,
      slaPct: total > 0 ? `${((slaMissed / total) * 100).toFixed(1)}%` : "0%",
      conversion: total > 0 ? `${((delivered / total) * 100).toFixed(1)}%` : "0%",
      c1Drop:
        byStage.C1 > 0 ? `${Math.round((byStage.C1A / byStage.C1) * 100)}%` : "—",
    };
  }, [leads]);

  if (leads.length === 0) {
    return (
      <ModuleShell moduleId="reports">
        <EmptyState
          title="No report data yet"
          description="Import leads from Excel to generate funnel, executive, and pipeline reports. You can still download the sample import template from Lead Upload."
          actionLabel="Go to Lead Upload"
        />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      moduleId="reports"
      actions={
        <ActionBar>
          <Btn onClick={() => void performAction("Export Pipeline Report")}>Export Excel Report</Btn>
          <Btn variant="outline" onClick={() => void performAction("Export Excel")}>
            Export Leads
          </Btn>
        </ActionBar>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total leads" value={kpis.total} />
        <StatCard label="SLA missed %" value={kpis.slaPct} accent="destructive" />
        <StatCard label="Conversion %" value={kpis.conversion} accent="success" />
        <StatCard label="C1 → C1A carry" value={kpis.c1Drop} accent="warning" />
      </div>

      <Section title="Executive performance">
        {execData.length > 0 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={execData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="leads" fill="hsl(217, 91%, 60%)" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No executive data yet.</p>
        )}
      </Section>

      <Section title="Report types">
        <p className="mb-3 text-sm text-muted-foreground">
          Export includes Leads sheet + Pipeline Report (stage funnel, sources, executives, KPIs).
        </p>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            "Lead source wise",
            "Stage wise funnel",
            "Executive performance",
            "Campaign ROI",
            "Lead aging",
            "Conversion %",
            "Lost by reason",
            "Dormant revived",
          ].map((r) => (
            <li key={r}>
              <button
                type="button"
                onClick={() => void performAction("Export Pipeline Report")}
                className="w-full rounded-lg bg-secondary/30 px-3 py-2 text-left font-medium transition-colors hover:bg-secondary/50"
              >
                {r} → Excel
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </ModuleShell>
  );
};

export default Reports;
