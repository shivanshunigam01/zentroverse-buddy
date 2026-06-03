import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { REPORTING_STAGES } from "@/domain/platform";
import { MACRO_FUNNEL_STEPS } from "@/domain/flow-nav";

const funnelData = [
  { stage: "C0", count: 1248, pct: 100 },
  { stage: "C1", count: 412, pct: 33 },
  { stage: "C1A", count: 186, pct: 15 },
  { stage: "C2", count: 98, pct: 8 },
  { stage: "C3", count: 67, pct: 5 },
];

const kpis = [
  { label: "WA reachable %", value: "78%", trend: "+2%" },
  { label: "Bot engagement %", value: "64%", trend: "+5%" },
  { label: "Hot lead %", value: "18%", trend: "+1%" },
  { label: "SLA missed %", value: "4.2%", trend: "-0.8%" },
  { label: "Booking conversion", value: "12.4%", trend: "+0.9%" },
  { label: "Avg response time", value: "8m", trend: "-2m" },
];

const AnalyticsDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((k) => (
        <div key={k.label} className="surface-card p-3 text-center sm:p-4">
          <p className="text-lg font-bold text-foreground sm:text-xl">{k.value}</p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">{k.label}</p>
          <p className="text-[10px] font-semibold text-success">{k.trend}</p>
        </div>
      ))}
    </div>

    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold">Macro funnel (C0 → C3)</h3>
      <p className="text-xs text-muted-foreground">Not C0–C9 — five macro stages + lifecycle</p>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="stage" width={36} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {funnelData.map((_, i) => (
                <Cell key={i} fill={`hsl(217, 91%, ${60 - i * 8}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {MACRO_FUNNEL_STEPS.map((s) => (
          <span key={s.code} className="text-xs text-muted-foreground">
            <strong className="text-foreground">{s.code}</strong> {s.title}
          </span>
        ))}
      </div>
    </div>

    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold">Reportable stages (simple reports)</h3>
      <p className="text-xs text-muted-foreground">Sub-status carries detail — e.g. Warm · Price Shared</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {REPORTING_STAGES.map((s) => (
          <span key={s} className="rounded-lg border border-border/80 bg-secondary/30 px-2.5 py-1 text-xs font-medium text-foreground">
            {s}
          </span>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="surface-card p-4">
        <h4 className="text-sm font-bold">Executive dashboard</h4>
        <ul className="mt-2 text-xs text-muted-foreground space-y-1">
          <li>Today&apos;s tasks · Hot leads · Follow-ups · Test drives · Bookings</li>
        </ul>
      </div>
      <div className="surface-card p-4">
        <h4 className="text-sm font-bold">Director dashboard</h4>
        <ul className="mt-2 text-xs text-muted-foreground space-y-1">
          <li>Territory · Campaign ROI · LTV · Forecasting</li>
        </ul>
      </div>
    </div>
  </div>
);

export default AnalyticsDashboard;
