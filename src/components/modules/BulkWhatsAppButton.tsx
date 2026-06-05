import { useCallback, useMemo, useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
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
import * as leadsApi from "@/api/leads.api";
import { isValidMobile, normalizeMobile } from "@/lib/mobile";
import type { Lead } from "@/adapters/lead-view.adapter";

const BATCH_SIZE = 40;

type Props = {
  leads: Lead[];
  disabled?: boolean;
};

export function BulkWhatsAppButton({ leads, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, sent: 0, failed: 0 });

  const uniqueMobiles = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const lead of leads) {
      if (!isValidMobile(lead.mobile)) continue;
      const key = normalizeMobile(lead.mobile);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(lead.mobile);
    }
    return out;
  }, [leads]);

  const runBulkSend = useCallback(async () => {
    if (uniqueMobiles.length === 0) {
      toast.error("No valid mobiles", { description: "Import leads with valid numbers first." });
      return;
    }

    setRunning(true);
    setProgress({ done: 0, total: uniqueMobiles.length, sent: 0, failed: 0 });

    let sent = 0;
    let failed = 0;

    try {
      for (let i = 0; i < uniqueMobiles.length; i += BATCH_SIZE) {
        const batch = uniqueMobiles.slice(i, i + BATCH_SIZE);
        const result = await leadsApi.sendBulkWhatsApp(batch);
        sent += result.sent;
        failed += result.failed;
        setProgress({
          done: Math.min(i + batch.length, uniqueMobiles.length),
          total: uniqueMobiles.length,
          sent,
          failed,
        });
      }

      toast.success("Bulk WhatsApp finished", {
        description: `${sent} sent · ${failed} failed · ${uniqueMobiles.length} unique numbers`,
      });
      setOpen(false);
    } catch (err) {
      toast.error("Bulk WhatsApp stopped", {
        description:
          err instanceof ApiClientError
            ? err.message
            : `Sent ${sent} before error · ${failed} failed`,
      });
    } finally {
      setRunning(false);
    }
  }, [uniqueMobiles]);

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <>
      <Btn
        variant="secondary"
        disabled={disabled || uniqueMobiles.length === 0 || running}
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center gap-2">
          <MessageCircle className="h-4 w-4" aria-hidden />
          Bulk WhatsApp
        </span>
      </Btn>

      <Dialog open={open} onOpenChange={(v) => !running && setOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" aria-hidden />
              Send bulk WhatsApp
            </DialogTitle>
            <DialogDescription>
              Campaign template <strong>flowtest</strong> will be sent to{" "}
              <strong>{uniqueMobiles.length}</strong> unique contact
              {uniqueMobiles.length === 1 ? "" : "s"} (one API call per number). This can take several
              minutes for large lists — keep this tab open.
            </DialogDescription>
          </DialogHeader>

          {running ? (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                Sending {progress.done} / {progress.total}…
              </div>
              <Progress value={pct} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Sent: {progress.sent} · Failed: {progress.failed}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Numbers are formatted as <code className="text-foreground">0XXXXXXXXXX</code> for the
              WhatsApp API. Duplicates in the inbox are skipped automatically.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Btn variant="outline" disabled={running} onClick={() => setOpen(false)}>
              Cancel
            </Btn>
            <Btn disabled={running || uniqueMobiles.length === 0} onClick={() => void runBulkSend()}>
              {running ? "Sending…" : `Send to ${uniqueMobiles.length} contacts`}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
