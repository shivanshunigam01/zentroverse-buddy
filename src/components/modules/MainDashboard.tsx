import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ModuleShell, { StatCard, Section } from "@/components/shared/ModuleShell";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import type { AppModuleId } from "@/domain/app-nav";

const sourceData = [
  { name: "Meta", value: 420 },
  { name: "Google", value: 280 },
  { name: "Walk-in", value: 190 },
  { name: "Website", value: 358 },
];

const stageData = [
  { stage: "C0", count: 1248 },
  { stage: "C1", count: 412 },
  { stage: "C1A", count: 186 },
  { stage: "C2", count: 98 },
  { stage: "C3", count: 67 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

const ChartWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="h-48 w-full min-h-[12rem] sm:h-56">{children}</div>
);

const STAT_LINKS: Partial<Record<string, AppModuleId>> = {
  "Total Leads": "lead-inbox",
  "New Leads": "lead-upload",
  "Hot Leads": "lead-inbox",
  "Pending Follow-ups": "action-engine",
  "SLA Missed": "lead-inbox",
  "Quotes Shared": "sales-pipeline",
  "Finance Pending": "finance-desk",
  Bookings: "booking-billing",
  Deliveries: "delivery-desk",
  "Dormant Leads": "re-engagement",
};

const MainDashboard = () => {
  const { navigate } = useDashboardActions();

  return (
  <ModuleShell moduleId="dashboard">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {[
        { label: "Total Leads", value: "1,248", accent: "primary" as const },
        { label: "New Leads", value: "186", sub: "+24 today", accent: "success" as const },
        { label: "Hot Leads", value: "89", accent: "destructive" as const },
        { label: "Pending Follow-ups", value: "156", accent: "warning" as const },
        { label: "SLA Missed", value: "23", sub: "4 critical", accent: "destructive" as const },
        { label: "Quotes Shared", value: "412" },
        { label: "Finance Pending", value: "67" },
        { label: "Bookings", value: "98", accent: "success" as const },
        { label: "Deliveries", value: "34" },
        { label: "Dormant Leads", value: "201" },
      ].map((s) => (
        <StatCard
          key={s.label}
          label={s.label}
          value={s.value}
          sub={s.sub}
          accent={s.accent}
          onClick={STAT_LINKS[s.label] ? () => navigate(STAT_LINKS[s.label]!) : undefined}
        />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
      <Section title="Lead source wise">
        <ChartWrap>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label>
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrap>
      </Section>

      <Section title="Stage wise funnel">
        <ChartWrap>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrap>
      </Section>

      <Section title="Executive performance">
        <div className="table-scroll md:overflow-visible md:border-0">
          <table className="w-full min-w-[280px] text-sm">
            <thead>
              <tr className="border-b text-left text-[10px] font-bold uppercase text-muted-foreground">
                <th className="pb-2 pr-4">Executive</th>
                <th className="pb-2 pr-4">Leads</th>
                <th className="pb-2">Conv %</th>
              </tr>
            </thead>
            <tbody>
              {["Anil S.", "Meera K.", "Rahul P."].map((e, i) => (
                <tr key={e} className="border-b border-border/50">
                  <td className="py-3 font-medium">{e}</td>
                  <td className="py-3 tabular-nums">{120 - i * 20}</td>
                  <td className="py-3 font-bold text-success">{14 - i}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Campaign ROI · Lead aging · Conversion">
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-3">
          <KpiBlock label="Campaign ROI" value="3.2x" />
          <KpiBlock label="Avg lead aging" value="18d" warn />
          <KpiBlock label="Conversion %" value="12.4%" primary />
        </div>
      </Section>
    </div>
  </ModuleShell>
  );
};

const KpiBlock = ({ label, value, warn, primary }: { label: string; value: string; warn?: boolean; primary?: boolean }) => (
  <div className="rounded-2xl bg-secondary/40 px-4 py-5 text-center">
    <p className={`text-2xl font-bold sm:text-3xl ${warn ? "text-warning" : primary ? "text-primary" : "text-foreground"}`}>{value}</p>
    <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
  </div>
);

export default MainDashboard;
