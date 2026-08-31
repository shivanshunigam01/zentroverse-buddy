import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Section } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import { fetchCrmFollowups, crmUpdateFollowup } from "@/api/crm.api";
import type { CrmFollowup } from "@/api/crm.api";
import { ApiClientError } from "@/lib/api";
import type { AppModuleId } from "@/domain/app-nav";

const VIEWS = [
  { id: "today", label: "Today" },
  { id: "overdue", label: "Overdue" },
  { id: "upcoming", label: "Upcoming" },
  { id: "", label: "All" },
] as const;

const CrmFollowups = () => {
  const [view, setView] = useState<string>("today");
  const [items, setItems] = useState<CrmFollowup[]>([]);
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta: m } = await fetchCrmFollowups({
        page,
        limit: pageSize,
        ...(view ? { view } : {}),
      });
      setItems(data);
      setMeta(m);
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "Failed to load follow-ups";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, view]);

  useEffect(() => {
    load();
  }, [load]);

  const complete = async (followup: CrmFollowup) => {
    try {
      await crmUpdateFollowup(followup.followup_id, { status: "COMPLETED", outcome: "Completed from queue" });
      toast.success("Follow-up completed");
      load();
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : "Could not complete follow-up");
    }
  };

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <ModuleShell moduleId={"crm-followups" as AppModuleId}>
      <Section title="Queue">
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((v) => (
            <button
              key={v.id || "all"}
              type="button"
              onClick={() => {
                setView(v.id);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                view === v.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Follow-ups">
        {loading && items.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center text-muted-foreground">Loading…</div>
        ) : error && items.length === 0 ? (
          <EmptyState title="Could not load follow-ups" description={error} />
        ) : items.length === 0 ? (
          <EmptyState title="No follow-ups" description="Schedule follow-ups from Lead 360." />
        ) : (
          <div className="space-y-2">
            {items.map((f) => (
              <div key={f.followup_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div>
                  <p className="font-semibold">{f.followup_type} · {f.lead_id || f.opportunity_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.assigned_to} · {new Date(f.scheduled_at).toLocaleString()} · {f.status}
                  </p>
                  {f.remarks ? <p className="mt-1 text-sm">{f.remarks}</p> : null}
                </div>
                {f.status !== "COMPLETED" && (
                  <button
                    type="button"
                    onClick={() => complete(f)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {meta && total > 0 && (
          <div className="mt-3">
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              pageSize={pageSize}
              canPrev={page > 1}
              canNext={page < totalPages}
              onPrev={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
              onPageChange={setPage}
            />
          </div>
        )}
      </Section>
    </ModuleShell>
  );
};

export default CrmFollowups;
