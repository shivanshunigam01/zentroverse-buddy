import { useEffect, useState } from "react";
import ModuleShell, { Section, StatCard } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { fetchCrmDashboard, type CrmDashboardStats } from "@/api/crm.api";
import { useCrmStore } from "@/store/crm-store";
import { ApiClientError } from "@/lib/api";

const isDashboardStats = (value: unknown): value is CrmDashboardStats =>
  value != null && typeof value === "object" && typeof (value as CrmDashboardStats).total_leads === "number";

const CrmDashboard = () => {
  const dashboard = useCrmStore((s) => s.dashboard);
  const setDashboard = useCrmStore((s) => s.setDashboard);
  const [loading, setLoading] = useState(() => !dashboard);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const stats = await fetchCrmDashboard();
        if (cancelled) return;
        if (!isDashboardStats(stats)) {
          setError("Dashboard data unavailable");
          return;
        }
        setDashboard(stats);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiClientError ? e.message : "Failed to load CRM dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setDashboard]);

  if (loading && !dashboard) {
    return (
      <ModuleShell moduleId="crm-dashboard">
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">Loading CRM dashboard…</div>
      </ModuleShell>
    );
  }

  if (error && !dashboard) {
    return (
      <ModuleShell moduleId="crm-dashboard">
        <EmptyState title="Could not load dashboard" description={error} />
      </ModuleShell>
    );
  }

  if (!dashboard) {
    return (
      <ModuleShell moduleId="crm-dashboard">
        <EmptyState title="No dashboard data" description="Try refreshing the page." />
      </ModuleShell>
    );
  }

  const d = dashboard;

  return (
    <ModuleShell moduleId="crm-dashboard">
      <Section title="Pipeline overview">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Leads" value={d.total_leads ?? 0} />
          <StatCard label="New Leads (C0)" value={d.new_leads ?? 0} />
          <StatCard label="Active Leads" value={d.active_leads ?? 0} />
          <StatCard label="Qualified" value={d.qualified_leads ?? 0} />
          <StatCard label="Hot" value={d.hot_leads ?? 0} />
          <StatCard label="Warm" value={d.warm_leads ?? 0} />
          <StatCard label="Cold" value={d.cold_leads ?? 0} />
          <StatCard label="Follow-ups Due" value={d.followups_due ?? 0} />
          <StatCard label="Lost" value={d.lost_leads ?? 0} />
          <StatCard label="Retail / Delivered" value={d.retail_delivered ?? 0} />
        </div>
      </Section>
    </ModuleShell>
  );
};

export default CrmDashboard;
