import { useCallback, useMemo, useState } from "react";
import { BarChart3, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Btn } from "@/components/shared/ModuleShell";
import { ApiClientError } from "@/lib/api";
import * as leadsApi from "@/api/leads.api";
import type { WhatsAppCampaignContact, WhatsAppCampaignReport } from "@/api/leads.api";

type TabKey = "all" | "sent" | "delivered" | "read_no_reply" | "replied" | "failed";

const TABS: { key: TabKey; label: string; summaryKey?: keyof WhatsAppCampaignReport["summary"] }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent", summaryKey: "sent" },
  { key: "delivered", label: "Delivered", summaryKey: "delivered" },
  { key: "read_no_reply", label: "Read · no reply", summaryKey: "readNoReply" },
  { key: "replied", label: "Replied", summaryKey: "replied" },
  { key: "failed", label: "Failed", summaryKey: "failed" },
];

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function contactsForTab(report: WhatsAppCampaignReport, tab: TabKey): WhatsAppCampaignContact[] {
  if (tab === "all") {
    const map = new Map<string, WhatsAppCampaignContact>();
    for (const bucket of Object.values(report.contacts)) {
      for (const row of bucket) map.set(row.mobile, row);
    }
    return [...map.values()];
  }
  return report.contacts[tab] ?? [];
}

function downloadCsv(report: WhatsAppCampaignReport, tab: TabKey) {
  const rows = contactsForTab(report, tab).sort((a, b) => a.mobile.localeCompare(b.mobile));
    lines.push(
      [
        r.mobile,
        `"${(r.userName || "").replace(/"/g, '""')}"`,
        r.status,
        r.sentAt || "",
        r.deliveredAt || "",
        r.readAt || "",
        r.repliedAt || "",
        `"${(r.error || "").replace(/"/g, '""')}"`,
      ].join(","),
    );
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `whatsapp-campaign-${report.campaign.name}-${tab}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function BulkWhatsAppReportButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<WhatsAppCampaignReport | null>(null);
  const [tab, setTab] = useState<TabKey>("all");

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leadsApi.getBulkWhatsAppReport();
      setReport(data);
      setTab("all");
    } catch (err) {
      toast.error("Could not load campaign report", {
        description: err instanceof ApiClientError ? err.message : "AiSensy API error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const openDialog = () => {
    setOpen(true);
    if (!report) void loadReport();
  };

  const tableRows = useMemo(() => {
    if (!report) return [];
    return contactsForTab(report, tab).sort((a, b) => a.mobile.localeCompare(b.mobile));
  }, [report, tab]);

  return (
    <>
      <Btn variant="outline" onClick={openDialog}>
        <span className="inline-flex items-center gap-2">
          <BarChart3 className="h-4 w-4" aria-hidden />
          WA Campaign Report
        </span>
      </Btn>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] sm:max-w-4xl overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
              WhatsApp campaign report
            </DialogTitle>
            <DialogDescription>
              Live data from AiSensy for campaign{" "}
              <strong>{report?.campaign.name ?? "flowtest"}</strong> — sent, delivered, read, replied,
              and failed numbers.
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground justify-center">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Fetching audience from AiSensy…
            </div>
          )}

          {!loading && report && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {TABS.filter((t) => t.summaryKey).map(({ key, label, summaryKey }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                      tab === key ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="text-lg font-bold">{summaryKey ? report.summary[summaryKey] : "—"}</div>
                    <div className="text-[11px] text-muted-foreground">{label}</div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTab("all")}
                  className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                    tab === "all" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/40"
                  }`}
                >
                  <div className="text-lg font-bold">{report.summary.total}</div>
                  <div className="text-[11px] text-muted-foreground">All unique</div>
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Pending delivery: {report.summary.pendingDelivery} · Last synced{" "}
                {formatWhen(report.fetchedAt)}
              </p>

              <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border/60">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Mobile</th>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Sent</th>
                      <th className="px-3 py-2 font-medium">Delivered</th>
                      <th className="px-3 py-2 font-medium">Read</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.id} className="border-t border-border/40">
                        <td className="px-3 py-2 font-mono text-xs">{row.mobile}</td>
                        <td className="px-3 py-2">{row.userName || "—"}</td>
                        <td className="px-3 py-2 capitalize">{row.status.replace(/_/g, " ")}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{formatWhen(row.sentAt)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{formatWhen(row.deliveredAt)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{formatWhen(row.readAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tableRows.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">No contacts in this bucket.</p>
                )}
              </div>
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Btn variant="outline" disabled={loading} onClick={() => void loadReport()}>
              Refresh
            </Btn>
            <Btn
              variant="outline"
              disabled={!report || loading}
              onClick={() => report && downloadCsv(report, tab)}
            >
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" aria-hidden />
                Export CSV
              </span>
            </Btn>
            <Btn onClick={() => setOpen(false)}>Close</Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
