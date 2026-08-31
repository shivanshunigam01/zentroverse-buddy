import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import ModuleShell, { Section } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import { fetchCrmCustomers, fetchCrmCustomer360, type CrmCustomer } from "@/api/crm.api";
import { ApiClientError } from "@/lib/api";
import type { AppModuleId } from "@/domain/app-nav";

const CrmCustomers = () => {
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ customer: CrmCustomer; leads: unknown[] } | null>(null);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta: m } = await fetchCrmCustomers({ page, limit: pageSize, search: search || undefined });
      setCustomers(data);
      setMeta(m);
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "Failed to load customers";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const viewCustomer = async (id: string) => {
    try {
      const data = await fetchCrmCustomer360(id);
      setSelected(data);
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : "Failed to load customer");
    }
  };

  return (
    <ModuleShell moduleId={"crm-customers" as AppModuleId}>
      <Section title="Search">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-app w-full pl-9"
          />
        </div>
      </Section>

      <Section title="Customers">
        {loading && customers.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center text-muted-foreground">Loading customers…</div>
        ) : error && customers.length === 0 ? (
          <EmptyState title="Could not load customers" description={error} />
        ) : customers.length === 0 ? (
          <EmptyState title="No customers found" description="Customers appear when leads are created or imported." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Customer ID</th>
                  <th className="px-3 py-2.5 font-semibold">Name</th>
                  <th className="px-3 py-2.5 font-semibold">Mobile</th>
                  <th className="px-3 py-2.5 font-semibold">Email</th>
                  <th className="px-3 py-2.5 font-semibold">City</th>
                  <th className="px-3 py-2.5 font-semibold">Created</th>
                  <th className="px-3 py-2.5 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.customer_id} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="px-3 py-2.5 font-mono text-xs">{c.customer_id}</td>
                    <td className="px-3 py-2.5 font-medium">{c.name}</td>
                    <td className="px-3 py-2.5">{c.mobile}</td>
                    <td className="px-3 py-2.5">{c.email ?? "—"}</td>
                    <td className="px-3 py-2.5">{c.city ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => viewCustomer(c.customer_id)}
                        className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
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

      {selected && (
        <Section title={`Customer 360 — ${selected.customer.name}`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Mobile</p>
              <p className="font-semibold">{selected.customer.mobile}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Email</p>
              <p className="font-semibold">{selected.customer.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Leads</p>
              <p className="font-semibold">{selected.leads.length}</p>
            </div>
          </div>
          {selected.leads.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {(selected.leads as Array<{ lead_id: string; product: string; status: string }>).map((l) => (
                <li key={l.lead_id} className="rounded-lg border border-border/50 px-3 py-2">
                  {l.lead_id} · {l.product} · {l.status}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </ModuleShell>
  );
};

export default CrmCustomers;
