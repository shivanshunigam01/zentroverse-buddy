import { useCallback, useEffect, useState } from "react";
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

const PAGE_SIZE = 100;

export function BulkWhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [contactCount, setContactCount] = useState<number | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0, sent: 0, failed: 0 });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoadingCount(true);
    void leadsApi
      .getBulkWhatsAppCount()
      .then((res) => {
        if (!cancelled) setContactCount(res.uniqueContacts);
      })
      .catch(() => {
        if (!cancelled) setContactCount(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingCount(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const runBulkSend = useCallback(async () => {
    if (!contactCount || contactCount === 0) {
      toast.error("No valid mobiles", { description: "Import leads with valid numbers first." });
      return;
    }

    setRunning(true);
    setProgress({ done: 0, total: contactCount, sent: 0, failed: 0 });

    let sent = 0;
    let failed = 0;
    let processed = 0;
    let page = 0;

    try {
      let hasMore = true;
      while (hasMore) {
        const result = await leadsApi.sendBulkWhatsAppAll(page, PAGE_SIZE);
        sent += result.sent;
        failed += result.failed;
        processed += result.total;
        hasMore = result.hasMore ?? false;
        page += 1;

        setProgress({
          done: Math.min(processed, contactCount),
          total: contactCount,
          sent,
          failed,
        });
      }

      toast.success("Bulk WhatsApp finished", {
        description: `${sent} sent · ${failed} failed · ${contactCount} unique contacts in database`,
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
  }, [contactCount]);

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  const countLabel =
    loadingCount ? "…" : contactCount === null ? "—" : String(contactCount);

  return (
    <>
      <Btn variant="secondary" disabled={running} onClick={() => setOpen(true)}>
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
              <strong>{countLabel}</strong> unique contact
              {contactCount === 1 ? "" : "s"} from your full lead database (one API call per
              number). This can take several minutes for large lists — keep this tab open.
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
              WhatsApp API. Duplicate numbers in the database are skipped automatically.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Btn variant="outline" disabled={running} onClick={() => setOpen(false)}>
              Cancel
            </Btn>
            <Btn
              disabled={running || loadingCount || !contactCount}
              onClick={() => void runBulkSend()}
            >
              {running ? "Sending…" : `Send to ${countLabel} contacts`}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
