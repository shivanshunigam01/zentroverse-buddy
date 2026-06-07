import { useCallback, useEffect, useState } from "react";
import { Loader2, PhoneForwarded } from "lucide-react";
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
import * as smartfloApi from "@/api/smartflo.api";
import type { SmartfloSyncResult } from "@/api/smartflo.api";

export function SmartfloSyncButton() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [result, setResult] = useState<SmartfloSyncResult | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void smartfloApi
      .getSmartfloConfig()
      .then((res) => {
        if (!cancelled) setConfigured(res.configured);
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const runSync = useCallback(async () => {
    setRunning(true);
    setResult(null);
    try {
      const syncResult = await smartfloApi.syncLeadsToSmartflo();
      setResult(syncResult);
      toast.success("Smartflo sync finished", {
        description: `${syncResult.uploaded} uploaded · ${syncResult.failed} failed · ${syncResult.totalLeads} total`,
      });
    } catch (err) {
      toast.error("Smartflo sync failed", {
        description: err instanceof ApiClientError ? err.message : "Could not upload leads to IVR",
      });
    } finally {
      setRunning(false);
    }
  }, []);

  const handleOpen = () => {
    setResult(null);
    setOpen(true);
  };

  return (
    <>
      <Btn variant="secondary" disabled={running} onClick={handleOpen}>
        <span className="inline-flex items-center gap-2">
          <PhoneForwarded className="h-4 w-4" aria-hidden />
          Sync Leads to Smartflo
        </span>
      </Btn>

      <Dialog open={open} onOpenChange={(v) => !running && setOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneForwarded className="h-5 w-5 text-primary" aria-hidden />
              Sync leads to Smartflo IVR
            </DialogTitle>
            <DialogDescription>
              Upload all website leads from your database to the Smartflo lead list in batches of
              500. Leads without a valid phone number are skipped automatically.
            </DialogDescription>
          </DialogHeader>

          {configured === false && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Smartflo is not configured on the server. Set{" "}
              <code className="text-xs">SMARTFLO_API_TOKEN</code> and{" "}
              <code className="text-xs">SMARTFLO_LEAD_LIST_ID</code> in the API .env.
            </p>
          )}

          {running && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                Uploading leads to Smartflo…
              </div>
              <Progress value={undefined} className="h-2 animate-pulse" />
              <p className="text-xs text-muted-foreground">
                Large lists may take several minutes. Keep this tab open.
              </p>
            </div>
          )}

          {result && !running && (
            <div className="space-y-3 rounded-xl border border-border/60 bg-secondary/20 p-4 text-sm">
              <p className="font-semibold text-foreground">Upload summary</p>
              <dl className="grid grid-cols-2 gap-2">
                <SummaryItem label="Total leads" value={result.totalLeads} />
                <SummaryItem label="Uploaded" value={result.uploaded} highlight="success" />
                <SummaryItem label="Failed" value={result.failed} highlight={result.failed > 0 ? "danger" : undefined} />
                <SummaryItem label="Skipped (invalid phone)" value={result.skipped} />
              </dl>
              {result.batchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-lg bg-background/60 p-2 text-xs">
                  <p className="mb-1 font-semibold text-muted-foreground">Batch results</p>
                  <ul className="space-y-1">
                    {result.batchResults.map((b) => (
                      <li key={b.batch_index} className="flex flex-wrap gap-x-2">
                        <span>Batch {b.batch_index}:</span>
                        <span className={b.status === "success" ? "text-green-600" : "text-destructive"}>
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

          {!running && !result && configured !== false && (
            <p className="text-sm text-muted-foreground">
              Mapping: phone → field_0, name → field_1, email → field_2, city → field_3. Duplicates
              are skipped by Smartflo.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Btn variant="outline" disabled={running} onClick={() => setOpen(false)}>
              {result ? "Close" : "Cancel"}
            </Btn>
            {!result && (
              <Btn disabled={running || configured === false || configured === null} onClick={() => void runSync()}>
                {running ? "Syncing…" : "Start sync"}
              </Btn>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: "success" | "danger";
}) {
  const color =
    highlight === "success"
      ? "text-green-600"
      : highlight === "danger"
        ? "text-destructive"
        : "text-foreground";

  return (
    <div>
      <dt className="text-[10px] font-bold uppercase text-muted-foreground">{label}</dt>
      <dd className={`text-lg font-bold tabular-nums ${color}`}>{value}</dd>
    </div>
  );
}
