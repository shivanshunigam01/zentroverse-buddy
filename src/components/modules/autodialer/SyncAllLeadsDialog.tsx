import { useCallback, useEffect, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Btn } from "@/components/shared/ModuleShell";
import { ApiClientError } from "@/lib/api";
import { getDialerLeadSyncStats, syncAllDialerLeads } from "@/api/dialer.api";
import type { DialerLeadSyncStats, DialerSyncAllResult } from "@/domain/dialer/types";

type Props = {
  disabled?: boolean;
  onComplete?: () => void;
};

function SummaryItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: "success" | "danger" | "muted";
}) {
  const color =
    highlight === "success"
      ? "text-green-600"
      : highlight === "danger"
        ? "text-destructive"
        : highlight === "muted"
          ? "text-muted-foreground"
          : "text-foreground";

  return (
    <div>
      <dt className="text-[10px] font-bold uppercase text-muted-foreground">{label}</dt>
      <dd className={`text-lg font-bold tabular-nums ${color}`}>{value.toLocaleString("en-IN")}</dd>
    </div>
  );
}

export function SyncAllLeadsDialog({ disabled, onComplete }: Props) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<DialerLeadSyncStats | null>(null);
  const [result, setResult] = useState<DialerSyncAllResult | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getDialerLeadSyncStats());
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Unable to load sync stats");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadStats();
  }, [open, loadStats]);

  const runSync = useCallback(async () => {
    setRunning(true);
    setResult(null);
    try {
      const syncResult = await syncAllDialerLeads();
      setResult(syncResult);
      toast.success("Smartflo sync finished", {
        description: `${syncResult.uploaded.toLocaleString("en-IN")} uploaded · ${syncResult.alreadySynced.toLocaleString("en-IN")} already synced · ${syncResult.failed} failed`,
      });
      onComplete?.();
    } catch (err) {
      toast.error("Smartflo sync failed", {
        description: err instanceof ApiClientError ? err.message : "Could not upload leads to Smartflo",
      });
    } finally {
      setRunning(false);
      void loadStats();
    }
  }, [loadStats, onComplete]);

  const handleOpen = () => {
    setResult(null);
    setOpen(true);
  };

  const syncBlocked = stats?.syncInProgress === true;

  return (
    <>
      <Btn disabled={disabled || running} onClick={handleOpen}>
        <span className="inline-flex items-center gap-2">
          <UploadCloud className="h-4 w-4" aria-hidden />
          Sync All Leads to Smartflo
        </span>
      </Btn>

      <Dialog open={open} onOpenChange={(v) => !running && setOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary" aria-hidden />
              Sync All Leads to Smartflo
            </DialogTitle>
            <DialogDescription>
              All eligible ZentroFLOW leads will be uploaded in bulk to the configured Smartflo Lead List
              ({`SMARTFLO_LEAD_LIST_ID`} on the server). Already synced leads are skipped automatically.
            </DialogDescription>
          </DialogHeader>

          {stats && !result && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-secondary/20 p-4 text-sm sm:grid-cols-4">
              <SummaryItem label="Total leads" value={stats.total} />
              <SummaryItem label="Already synced" value={stats.alreadySynced} highlight="muted" />
              <SummaryItem label="Pending sync" value={stats.pendingSync} />
              <SummaryItem label="Failed / invalid" value={stats.failed + stats.invalid} highlight={stats.failed > 0 ? "danger" : undefined} />
            </div>
          )}

          {syncBlocked && !running && !result && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
              Lead synchronization is already in progress. Please wait for it to finish.
            </p>
          )}

          {running && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                Syncing leads with Smartflo…
              </div>
              <Progress value={undefined} className="h-2 animate-pulse" />
              <p className="text-xs text-muted-foreground">
                Bulk uploads run in batches of 500. Large lists may take several minutes — keep this tab open.
              </p>
            </div>
          )}

          {result && !running && (
            <div className="space-y-3 rounded-xl border border-border/60 bg-secondary/20 p-4 text-sm">
              <p className="font-semibold text-foreground">
                Upload summary · {result.status}
              </p>
              <dl className="grid grid-cols-2 gap-2">
                <SummaryItem label="Total leads" value={result.total} />
                <SummaryItem label="Uploaded" value={result.uploaded} highlight="success" />
                <SummaryItem label="Already synced" value={result.alreadySynced} highlight="muted" />
                <SummaryItem label="Invalid" value={result.invalid} />
                <SummaryItem label="Failed" value={result.failed} highlight={result.failed > 0 ? "danger" : undefined} />
                <SummaryItem label="Eligible" value={result.eligible} />
              </dl>
              {result.batchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-lg bg-background/60 p-2 text-xs">
                  <p className="mb-1 font-semibold text-muted-foreground">Batch results</p>
                  <ul className="space-y-1">
                    {result.batchResults.map((b) => (
                      <li key={b.batch_index} className="flex flex-wrap gap-x-2">
                        <span>Batch {b.batch_index}:</span>
                        <span className={b.status === "success" ? "text-green-600" : b.status === "failed" ? "text-destructive" : "text-amber-600"}>
                          {b.status}
                        </span>
                        <span>
                          {b.uploaded_count}/{b.lead_count} uploaded
                        </span>
                        {b.batch_id && (
                          <span className="font-mono text-muted-foreground">ID {b.batch_id}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!running && !result && stats && (
            <p className="text-sm text-muted-foreground">
              {stats.eligible.toLocaleString("en-IN")} lead(s) are eligible for upload. Invalid mobile numbers are
              excluded and reported in the sync summary.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Btn variant="outline" disabled={running} onClick={() => setOpen(false)}>
              {result ? "Close" : "Cancel"}
            </Btn>
            {!result && (
              <Btn
                disabled={running || syncBlocked || !stats || stats.eligible === 0}
                onClick={() => void runSync()}
              >
                {running ? "Syncing…" : "Start sync"}
              </Btn>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
