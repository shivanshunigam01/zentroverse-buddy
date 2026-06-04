import { useEffect, useState } from "react";
import { fetchDashboardStats, type DashboardStats } from "@/api/dashboard.api";
import { fetchPipelineReport, type PipelineReport } from "@/api/reports.api";

export function useLiveStats(enabled = true) {
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [pipeline, setPipeline] = useState<PipelineReport | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const [d, p] = await Promise.all([fetchDashboardStats(), fetchPipelineReport()]);
        if (!cancelled) {
          setDashboard(d);
          setPipeline(p);
        }
      } catch {
        /* fall back to store-derived stats in UI */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { dashboard, pipeline, loading };
}
