import { useEffect, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Btn, Section } from "@/components/shared/ModuleShell";
import { DATABASE_TABLES } from "@/domain/platform";
import { fetchModuleAccess } from "@/api/access.api";
import { listCustomers } from "@/api/customers.api";
import {
  createMasterOrg,
  createMasterProduct,
  listMasterBranches,
  listMasterOrgs,
  listMasterProducts,
  listMasterRoles,
} from "@/api/action-engine.api";
import { ApiClientError } from "@/lib/api";

const MastersSettings = () => {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [modules, setModules] = useState<Record<string, { allowed: boolean }> | null>(null);
  const [orgs, setOrgs] = useState<Awaited<ReturnType<typeof listMasterOrgs>>>([]);
  const [branches, setBranches] = useState<Awaited<ReturnType<typeof listMasterBranches>>>([]);
  const [products, setProducts] = useState<Awaited<ReturnType<typeof listMasterProducts>>>([]);
  const [roles, setRoles] = useState<Awaited<ReturnType<typeof listMasterRoles>>>([]);
  const [orgName, setOrgName] = useState("");
  const [productModel, setProductModel] = useState("");

  const loadMasters = async () => {
    try {
      const [o, b, p, r] = await Promise.all([
        listMasterOrgs(),
        listMasterBranches(),
        listMasterProducts(),
        listMasterRoles(),
      ]);
      setOrgs(o);
      setBranches(b);
      setProducts(p);
      setRoles(r);
    } catch {
      /* Action Engine offline */
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [access, customers] = await Promise.all([
          fetchModuleAccess(),
          listCustomers(500),
        ]);
        setModules(access);
        setCustomerCount(customers.length);
      } catch (err) {
        toast.error("Could not load settings", {
          description: err instanceof ApiClientError ? err.message : "API error",
        });
      }
      await loadMasters();
    })();
  }, []);

  return (
    <ModuleShell moduleId="masters">
      <Section title="API status">
        <p className="text-sm text-muted-foreground">
          Customers in DB: <strong>{customerCount ?? "…"}</strong> (GET /customers)
        </p>
        {modules && (
          <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
            {Object.entries(modules).map(([key, val]) => (
              <li key={key} className="rounded-md bg-secondary/40 px-2 py-1 font-mono">
                {key}: {val.allowed ? "allowed" : "blocked"}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Organisation & branches">
          <div className="mb-3 flex gap-2">
            <input
              className="input-app flex-1 px-3 py-2 text-sm"
              placeholder="New organisation name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <Btn
              onClick={() =>
                void createMasterOrg(orgName || "New Org")
                  .then(() => {
                    setOrgName("");
                    toast.success("Organisation created");
                    return loadMasters();
                  })
                  .catch((e) => toast.error(String(e.message ?? e)))
              }
            >
              Add
            </Btn>
          </div>
          <ul className="space-y-2 text-sm">
            {orgs.map((o) => (
              <li key={o.organisation_id} className="rounded-lg border border-border/60 px-3 py-2">
                {o.name} · {o.oem_brand || "—"}
              </li>
            ))}
            {branches.map((b) => (
              <li key={b.branch_id} className="rounded-lg border border-border/60 px-3 py-2 text-xs">
                Branch {b.name} · {b.territory}
              </li>
            ))}
            {orgs.length === 0 && (
              <p className="text-xs text-muted-foreground">Start zentroflow-api (:4000) to manage masters.</p>
            )}
          </ul>
        </Section>

        <Section title="Products & roles">
          <div className="mb-3 flex gap-2">
            <input
              className="input-app flex-1 px-3 py-2 text-sm"
              placeholder="New model"
              value={productModel}
              onChange={(e) => setProductModel(e.target.value)}
            />
            <Btn
              onClick={() =>
                void createMasterProduct(productModel || "Model", "OEM")
                  .then(() => {
                    setProductModel("");
                    toast.success("Product created");
                    return loadMasters();
                  })
                  .catch((e) => toast.error(String(e.message ?? e)))
              }
            >
              Add
            </Btn>
          </div>
          <ul className="space-y-2 text-sm">
            {products.map((p) => (
              <li key={p.product_id} className="rounded-lg border border-border/60 px-3 py-2">
                {p.oem} {p.model} {p.variant}
              </li>
            ))}
            {roles.map((r) => (
              <li key={r.role_id} className="rounded-lg border border-border/60 px-3 py-2 text-xs">
                Role {r.name} · {r.permissions.slice(0, 3).join(", ")}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Database tables (backend reference)">
        <div className="flex flex-wrap gap-1.5">
          {DATABASE_TABLES.map((t) => (
            <span key={t} className="rounded-md bg-secondary px-2 py-1 font-mono text-[10px]">
              {t}
            </span>
          ))}
        </div>
      </Section>
    </ModuleShell>
  );
};

export default MastersSettings;
