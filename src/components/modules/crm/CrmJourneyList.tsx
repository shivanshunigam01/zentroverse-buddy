import { useCallback, useEffect, useState } from "react";
import ModuleShell, { Section } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AppModuleId } from "@/domain/app-nav";
import { ApiClientError } from "@/lib/api";

type Props = {
  moduleId: AppModuleId;
  title: string;
  fetchList: (params: Record<string, string | number>) => Promise<{ data: Array<Record<string, unknown>>; meta: { page: number; totalPages: number; total: number } }>;
  columns: Array<{ key: string; label: string }>;
};

const CrmJourneyList = ({ moduleId, title, fetchList, columns }: Props) => {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta: m } = await fetchList({ page, limit: pageSize });
      setItems(data);
      setMeta({ page: m.page, totalPages: m.totalPages, total: m.total });
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [fetchList, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <ModuleShell moduleId={moduleId}>
      <Section title={title}>
        {loading && items.length === 0 ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : error ? (
          <EmptyState title="Could not load" description={error} />
        ) : items.length === 0 ? (
          <EmptyState title="No records" description="Create records from Lead 360." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  {columns.map((c) => <th key={c.key} className="px-3 py-2">{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {columns.map((c) => <td key={c.key} className="px-3 py-2">{String(row[c.key] ?? "—")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.total > 0 && (
          <div className="mt-3">
            <TablePagination
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              rangeStart={(page - 1) * pageSize + 1}
              rangeEnd={Math.min(page * pageSize, meta.total)}
              pageSize={pageSize}
              canPrev={page > 1}
              canNext={page < meta.totalPages}
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

export default CrmJourneyList;
