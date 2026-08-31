import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import ModuleShell, { Section } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import { fetchCrmLeads } from "@/api/crm.api";
import { useCrmStore } from "@/store/crm-store";
import { ApiClientError } from "@/lib/api";
import type { AppModuleId } from "@/domain/app-nav";

type Props = {
  onViewLead: (leadId: string) => void;
};

const STAGE_OPTIONS = ["", "C0", "C1", "C1A", "C2", "C3", "lifecycle"];

const FILTER_KEYS = [
  "search", "stage", "owner", "source", "status", "qualification_status",
  "duplicate_status", "score_classification", "temperature", "followup_status",
  "date_from", "date_to", "sort", "order",
] as const;

const CrmLeadList = ({ onViewLead }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hydrated = useRef(false);
  const {
    filters,
    page,
    pageSize,
    leads,
    leadsMeta,
    loading,
    error,
    setFilters,
    clearFilters,
    setPage,
    setLeads,
    setLoading,
    setError,
    setSelectedLeadId,
  } = useCrmStore();

  useEffect(() => {
    if (hydrated.current) return;
    const patch: Record<string, string> = {};
    for (const key of FILTER_KEYS) {
      const v = searchParams.get(key);
      if (v) patch[key] = v;
    }
    const pageParam = searchParams.get("page");
    if (Object.keys(patch).length) setFilters(patch);
    if (pageParam) setPage(Number(pageParam) || 1);
    hydrated.current = true;
  }, [searchParams, setFilters, setPage]);

  useEffect(() => {
    if (!hydrated.current) return;
    const next = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const v = filters[key];
      if (v) next.set(key, v);
    }
    if (page > 1) next.set("page", String(page));
    setSearchParams(next, { replace: true });
  }, [filters, page, setSearchParams]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await fetchCrmLeads({
        page,
        limit: pageSize,
        search: filters.search || undefined,
        stage: filters.stage || undefined,
        owner: filters.owner || undefined,
        source: filters.source || undefined,
        status: filters.status || undefined,
        qualification_status: filters.qualification_status || undefined,
        duplicate_status: filters.duplicate_status || undefined,
        score_classification: filters.score_classification || undefined,
        temperature: filters.temperature || undefined,
        followup_status: filters.followup_status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        sort: filters.sort,
        order: filters.order,
      });
      setLeads(data, meta);
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "Failed to load leads";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, setError, setLeads, setLoading]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const total = leadsMeta?.total ?? 0;
  const totalPages = leadsMeta?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const ownerOptions = useMemo(() => {
    const set = new Set(leads.map((l) => l.current_owner).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  const handleView = (opportunityId: string) => {
    setSelectedLeadId(opportunityId);
    onViewLead(opportunityId);
  };

  return (
    <ModuleShell moduleId={"crm-leads" as AppModuleId}>
      <Section title="Filters">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search name, mobile, lead ID…"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="input-app w-full pl-9"
            />
          </div>
          <select
            value={filters.stage}
            onChange={(e) => setFilters({ stage: e.target.value })}
            className="input-app w-full"
            aria-label="Stage filter"
          >
            {STAGE_OPTIONS.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? `Stage ${s}` : "All stages"}
              </option>
            ))}
          </select>
          <select
            value={filters.owner}
            onChange={(e) => setFilters({ owner: e.target.value })}
            className="input-app w-full"
            aria-label="Owner filter"
          >
            <option value="">All owners</option>
            {ownerOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Source"
            value={filters.source}
            onChange={(e) => setFilters({ source: e.target.value })}
            className="input-app w-full"
          />
          <select
            value={filters.qualification_status}
            onChange={(e) => setFilters({ qualification_status: e.target.value })}
            className="input-app w-full"
            aria-label="Qualification filter"
          >
            <option value="">All qualification</option>
            <option value="PENDING">Pending</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="DISQUALIFIED">Disqualified</option>
          </select>
          <select
            value={filters.score_classification}
            onChange={(e) => setFilters({ score_classification: e.target.value })}
            className="input-app w-full"
            aria-label="Score filter"
          >
            <option value="">All scores</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
            <option value="Critical">Critical</option>
          </select>
          <select
            value={filters.temperature}
            onChange={(e) => setFilters({ temperature: e.target.value })}
            className="input-app w-full"
            aria-label="Temperature filter"
          >
            <option value="">All temperatures</option>
            <option value="HOT">Hot</option>
            <option value="WARM">Warm</option>
            <option value="NURTURE">Nurture</option>
            <option value="COLD">Cold</option>
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ sort: e.target.value })}
            className="input-app w-full"
            aria-label="Sort field"
          >
            <option value="created_at">Sort: Created</option>
            <option value="updated_at">Sort: Updated</option>
            <option value="last_activity_at">Sort: Last activity</option>
            <option value="next_action_date">Sort: Next follow-up</option>
            <option value="lead_score">Sort: Score</option>
            <option value="current_owner">Sort: Owner</option>
            <option value="source">Sort: Source</option>
          </select>
          <select
            value={filters.order}
            onChange={(e) => setFilters({ order: e.target.value as "asc" | "desc" })}
            className="input-app w-full"
            aria-label="Sort order"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <select
            value={filters.followup_status}
            onChange={(e) => setFilters({ followup_status: e.target.value })}
            className="input-app w-full"
            aria-label="Follow-up filter"
          >
            <option value="">All follow-ups</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due today</option>
            <option value="upcoming">Upcoming</option>
          </select>
          <select
            value={filters.duplicate_status}
            onChange={(e) => setFilters({ duplicate_status: e.target.value })}
            className="input-app w-full"
            aria-label="Duplicate filter"
          >
            <option value="">All duplicates</option>
            <option value="NEW">New</option>
            <option value="LIKELY_DUPLICATE">Likely duplicate</option>
            <option value="CONFIRMED_DUPLICATE">Confirmed duplicate</option>
          </select>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ date_from: e.target.value })}
            className="input-app w-full"
            aria-label="From date"
          />
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ date_to: e.target.value })}
            className="input-app w-full"
            aria-label="To date"
          />
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-border/80 px-3 text-xs font-semibold hover:bg-secondary/60"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        </div>
      </Section>

      <Section title="Leads">
        {loading && leads.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center text-muted-foreground">Loading leads…</div>
        ) : error && leads.length === 0 ? (
          <EmptyState title="Could not load leads" description={error} />
        ) : leads.length === 0 ? (
          <EmptyState title="No leads found" description="Try adjusting filters or import leads from Lead Upload." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Lead ID</th>
                  <th className="px-3 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 font-semibold">Mobile</th>
                  <th className="px-3 py-2.5 font-semibold">Source</th>
                  <th className="px-3 py-2.5 font-semibold">Campaign</th>
                  <th className="px-3 py-2.5 font-semibold">Stage</th>
                  <th className="px-3 py-2.5 font-semibold">Owner</th>
                  <th className="px-3 py-2.5 font-semibold">Created</th>
                  <th className="px-3 py-2.5 font-semibold">Score</th>
                  <th className="px-3 py-2.5 font-semibold">Qualification</th>
                  <th className="px-3 py-2.5 font-semibold">Next follow-up</th>
                  <th className="px-3 py-2.5 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {leads.map((row) => (
                  <tr key={row.opportunity_id} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="px-3 py-2.5 font-mono text-xs">{row.lead_id}</td>
                    <td className="px-3 py-2.5 font-medium">{row.customer_name ?? "—"}</td>
                    <td className="px-3 py-2.5 tabular-nums">{row.customer_mobile ?? "—"}</td>
                    <td className="px-3 py-2.5">{row.source}</td>
                    <td className="px-3 py-2.5">{row.campaign ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {row.current_micro_stage}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{row.current_owner}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-semibold">{row.score_classification ?? "Cold"}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({row.lead_score ?? 0})</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">{row.qualification_status ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs">
                      {row.next_action_date ? new Date(row.next_action_date).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => handleView(row.opportunity_id)}
                        className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {leadsMeta && total > 0 && (
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

export default CrmLeadList;
