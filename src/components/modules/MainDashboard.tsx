import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ModuleShell, { StatCard, Section, Btn } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useLiveStats } from "@/hooks/use-live-stats";
import { useOpportunityLeads } from "@/store/selectors";
import type { AppModuleId } from "@/domain/app-nav";
import { fetchEngineHealth } from "@/api/action-engine.api";
import { findGoldenRuleExceptions } from "@/domain/entities/golden-rule";
import { useZentroFlowStore } from "@/store/opportunity-store";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

const ChartWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="h-48 w-full min-h-[12rem] sm:h-56">{children}</div>
);

const STAT_LINKS: Partial<Record<string, AppModuleId>> = {
  "Total Leads": "lead-inbox",
  "Hot Leads": "lead-inbox",
  "SLA Missed": "lead-inbox",
  "Open (C0)": "lead-inbox",
  "In Sales (C1)": "sales-pipeline",
  "Finance (C1A)": "finance-desk",
  "Booking (C2)": "booking-billing",
  "Delivered": "delivery-desk",
};

const MainDashboard = () => {
  const { navigate, performAction } = useDashboardActions();
  const leads = useOpportunityLeads();
  const opportunities = useZentroFlowStore((s) => s.listOpportunities());
  const contactHealth = useZentroFlowStore((s) => s.contactHealth);
  const { dashboard, pipeline } = useLiveStats(leads.length > 0);
  const [engineHealth, setEngineHealth] = useState<Awaited<ReturnType<typeof fetchEngineHealth>> | null>(null);

  useEffect(() => {
    void fetchEngineHealth().then(setEngineHealth).catch(() => setEngineHealth(null));
  }, []);

  const stats = useMemo(() => {
    const byStage = { C0: 0, C1: 0, C1A: 0, C2: 0, C3: 0, lifecycle: 0 };
    const bySource: Record<string, number> = {};
    let hot = 0;
    let slaMissed = 0;
    let delivered = 0;

    for (const l of leads) {
      const stage = l.currentStage as keyof typeof byStage;
      if (stage in byStage) byStage[stage]++;
      bySource[l.source ?? "Unknown"] = (bySource[l.source ?? "Unknown"] ?? 0) + 1;
      if (l.scoreLabel === "Hot" || l.scoreLabel === "Critical") hot++;
      if (l.slaCountdown === "Overdue") slaMissed++;
      if (l.status === "Delivered") delivered++;
    }

    if (dashboard) {
      hot = dashboard.hot ?? hot;
      slaMissed = dashboard.slaMissed ?? slaMissed;
    }

    if (pipeline?.funnel?.length) {
      for (const row of pipeline.funnel) {
        const id = row._id as keyof typeof byStage | null;
        if (id && id in byStage) byStage[id] = row.count;
      }
    }

    if (pipeline?.sources?.length) {
      for (const row of pipeline.sources) {
        if (row._id) bySource[String(row._id)] = row.count;
      }
    }

    return {
      total: dashboard?.totalLeads ?? leads.length,
      hot,
      slaMissed,
      delivered,
      byStage,
      bySource,
    };
  }, [leads, dashboard, pipeline]);

  const sourceData = useMemo(
    () => Object.entries(stats.bySource).map(([name, value]) => ({ name, value })),
    [stats.bySource],
  );

  const stageData = useMemo(
    () =>
      (["C0", "C1", "C1A", "C2", "C3"] as const).map((stage) => ({
        stage,
        count: stats.byStage[stage],
      })),
    [stats.byStage],
  );

  const goldenExceptions = useMemo(() => findGoldenRuleExceptions(opportunities), [opportunities]);

  const contactHealthStats = useMemo(() => {
    const rows = Object.values(contactHealth);
    if (rows.length === 0) {
      return { wa: 0, call: 0, mobile: 0, total: leads.length };
    }
    return {
      total: rows.length,
      wa: rows.filter((r) => r.whatsapp_active).length,
      call: rows.filter((r) => r.call_reachable).length,
      mobile: rows.filter((r) => r.mobile_valid).length,
    };
  }, [contactHealth, leads.length]);

  if (leads.length === 0) {
    return (
      <ModuleShell moduleId="dashboard">
        <EmptyState
          title="No leads yet"
          description="Upload an Excel file to import customers and opportunities. Each row starts at C0.1 Contact."
        />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell moduleId="dashboard">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { label: "Total Leads", value: stats.total, accent: "primary" as const },
          { label: "Hot Leads", value: stats.hot, accent: "destructive" as const },
          { label: "SLA Missed", value: stats.slaMissed, accent: "destructive" as const },
          { label: "Open (C0)", value: stats.byStage.C0, accent: "warning" as const },
          { label: "In Sales (C1)", value: stats.byStage.C1 },
          { label: "Finance (C1A)", value: stats.byStage.C1A },
          { label: "Booking (C2)", value: stats.byStage.C2 },
          { label: "Delivered", value: stats.delivered, accent: "success" as const },
        ].map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            accent={s.accent}
            onClick={STAT_LINKS[s.label] ? () => navigate(STAT_LINKS[s.label]!) : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <Section title="Lead source wise (API)">
          {sourceData.length > 0 ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <p className="text-sm text-muted-foreground">No source data.</p>
          )}
        </Section>

        <Section title="Stage wise funnel (API)">
          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrap>
        </Section>

        <Section title="Manager · health exceptions">
          <p className="mb-2 text-sm text-muted-foreground">
            Golden-rule orphans (local): <strong>{goldenExceptions.length}</strong>
            {engineHealth
              ? ` · Engine API: ${engineHealth.status}, orphans ${engineHealth.orphan_leads?.length ?? 0}`
              : " · Engine API offline"}
          </p>
          {goldenExceptions.slice(0, 5).map((e) => (
            <p key={e.opportunity_id} className="font-mono text-xs text-warning">
              {e.opportunity_id}: {e.violations.map((v) => v.field).join(", ")}
            </p>
          ))}
          <Btn className="mt-3" variant="outline" onClick={() => navigate("action-engine")}>
            Open Action Engine
          </Btn>
        </Section>

        <Section title="Contact health">
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <StatCard label="Profiles" value={contactHealthStats.total} />
            <StatCard label="WA active" value={contactHealthStats.wa} accent="success" />
            <StatCard label="Callable" value={contactHealthStats.call} />
            <StatCard label="Mobile valid" value={contactHealthStats.mobile} />
          </div>
        </Section>

        <Section title="Quick start">
          <p className="mb-3 text-sm text-muted-foreground">
            Stats from GET /dashboard/stats and GET /reports/pipeline.
          </p>
          <Btn variant="outline" onClick={() => void performAction("Export Excel")}>
            Export Excel (API)
          </Btn>
          <Btn onClick={() => navigate("lead-inbox")}>Open Lead Inbox</Btn>
        </Section>
      </div>
    </ModuleShell>
  );
};

export default MainDashboard;
