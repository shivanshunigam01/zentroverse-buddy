import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ModuleShell, { Section, StatCard, Btn, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useLiveStats } from "@/hooks/use-live-stats";
import { useOpportunityLeads } from "@/store/selectors";

const Reports = () => {
  const { performAction } = useDashboardActions();
  const leads = useOpportunityLeads();
  const { dashboard, pipeline } = useLiveStats(leads.length > 0);

  const execData = useMemo(() => {
    if (pipeline?.executives?.length) {
      return pipeline.executives
        .filter((e) => e._id)
        .map((e) => ({
          name: String(e._id).split(" ")[0],
          leads: e.count,
          conv: 0,
        }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 8);
    }
    const byOwner: Record<string, number> = {};
    for (const l of leads) {
      byOwner[l.currentOwner] = (byOwner[l.currentOwner] ?? 0) + 1;
    }
    return Object.entries(byOwner)
      .map(([name, leadsCount]) => ({ name: name.split(" ")[0] ?? name, leads: leadsCount, conv: 0 }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 8);
  }, [leads, pipeline]);

  const kpis = useMemo(() => {
    const total = dashboard?.totalLeads ?? leads.length;
    const slaMissed = dashboard?.slaMissed ?? leads.filter((l) => l.slaCountdown === "Overdue").length;
    const delivered = leads.filter((l) => l.status === "Delivered").length;
    return {
      total,
      slaPct: total > 0 ? `${((slaMissed / total) * 100).toFixed(1)}%` : "0%",
      conversion: total > 0 ? `${((delivered / total) * 100).toFixed(1)}%` : "0%",
      hot: dashboard?.hot ?? leads.filter((l) => l.scoreLabel === "Hot").length,
    };
  }, [leads, dashboard]);

  if (leads.length === 0) {
    return (
      <ModuleShell moduleId="reports">
        <EmptyState
          title="No report data yet"
          description="Import leads from Excel to generate funnel, executive, and pipeline reports."
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
          <Btn onClick={() => void performAction("Export Pipeline Report")}>Export Excel Report (API)</Btn>
          <Btn variant="outline" onClick={() => void performAction("Export Excel")}>
            Export Leads (API)
          </Btn>
        </ActionBar>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total leads" value={kpis.total} />
        <StatCard label="Hot leads" value={kpis.hot} accent="destructive" />
        <StatCard label="SLA missed %" value={kpis.slaPct} accent="destructive" />
        <StatCard label="Conversion %" value={kpis.conversion} accent="success" />
      </div>

      <Section title="Executive performance (GET /reports/pipeline)">
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
          Exports use GET /reports/export from the server.
        </p>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            "Lead source wise",
            "Stage wise funnel",
            "Executive performance",
            "Pipeline KPIs",
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
