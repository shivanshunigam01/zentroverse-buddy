import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchDashboardStats } from "@/api/dashboard.api";
import { refreshFromApi } from "@/services/sync.service";
import { ApiClientError } from "@/lib/api";

export function useApiBootstrap() {
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshFromApi();
        await fetchDashboardStats().catch(() => undefined);
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof ApiClientError ? err.message : "Could not load data from API";
          toast.error("Sync failed", { description: msg });
        }
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, syncing };
}
