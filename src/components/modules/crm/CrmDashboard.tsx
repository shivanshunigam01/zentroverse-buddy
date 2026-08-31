import { useEffect } from "react";
import ModuleShell, { Section, StatCard } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { fetchCrmDashboard } from "@/api/crm.api";
import { useCrmStore } from "@/store/crm-store";
import { ApiClientError } from "@/lib/api";

const CrmDashboard = () => {
  const { dashboard, loading, error, setDashboard, setLoading, setError } = useCrmStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const stats = await fetchCrmDashboard();
        if (!cancelled) setDashboard(stats);
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
  }, [setDashboard, setError, setLoading]);

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

  const d = dashboard!;

  return (
    <ModuleShell moduleId="crm-dashboard">
      <Section title="Pipeline overview">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Leads" value={d.total_leads} />
          <StatCard label="New Leads (C0)" value={d.new_leads} />
          <StatCard label="Active Leads" value={d.active_leads} />
          <StatCard label="Qualified" value={d.qualified_leads} />
          <StatCard label="Hot" value={d.hot_leads} />
          <StatCard label="Warm" value={d.warm_leads} />
          <StatCard label="Cold" value={d.cold_leads} />
          <StatCard label="Follow-ups Due" value={d.followups_due} />
          <StatCard label="Lost" value={d.lost_leads} />
          <StatCard label="Retail / Delivered" value={d.retail_delivered} />
        </div>
      </Section>
    </ModuleShell>
  );
};

export default CrmDashboard;
