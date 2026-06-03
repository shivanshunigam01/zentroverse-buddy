import { DUPLICATE_TYPES, LEAD_TYPES } from "@/domain/platform";

const healthChecks = [
  { check: "Mobile valid", status: "Valid", score: "+10", action: "Proceed" },
  { check: "WhatsApp active", status: "Active", score: "+15", action: "Bot engagement" },
  { check: "Call reachable", status: "Reachable", score: "+10", action: "Dialer if WA fails" },
  { check: "Email valid", status: "—", score: "—", action: "Optional capture" },
  { check: "Territory valid", status: "In territory", score: "+10", action: "Assign branch" },
  { check: "Duplicate status", status: "CROSS_SELL", score: "—", action: "New opportunity — Tata Intra" },
];

const ContactHealthModule = () => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.05] p-4">
      <p className="text-sm font-bold text-foreground">Runs in C0.3 — supports entire funnel</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Identity resolution: same customer vs same opportunity. Never block cross-sell or fleet expansion.
      </p>
    </div>

    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold">Contact health matrix</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b text-left text-[10px] font-bold uppercase text-muted-foreground">
              <th className="pb-2 pr-4">Check</th>
              <th className="pb-2 pr-4">Result</th>
              <th className="pb-2 pr-4">Score impact</th>
              <th className="pb-2">Next action</th>
            </tr>
          </thead>
          <tbody>
            {healthChecks.map((row) => (
              <tr key={row.check} className="border-b border-border/50">
                <td className="py-3 font-medium text-foreground">{row.check}</td>
                <td className="py-3 text-muted-foreground">{row.status}</td>
                <td className="py-3 font-mono text-xs">{row.score}</td>
                <td className="py-3 text-xs text-primary font-semibold">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-center text-2xl font-bold text-foreground">Contactability score: 82</p>
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="surface-card p-4">
        <h4 className="text-sm font-bold">Lead types (not just duplicate)</h4>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {LEAD_TYPES.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="surface-card p-4">
        <h4 className="text-sm font-bold">duplicate_type (DB)</h4>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DUPLICATE_TYPES.map((t) => (
            <span key={t} className="rounded-md bg-secondary px-2 py-1 font-mono text-[10px] text-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ContactHealthModule;
