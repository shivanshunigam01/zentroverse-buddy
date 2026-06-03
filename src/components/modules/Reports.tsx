import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import ModuleShell, { Section, StatCard } from "@/components/shared/ModuleShell";

const execData = [
  { name: "Anil", conv: 14, leads: 98 },
  { name: "Meera", conv: 12, leads: 87 },
  { name: "Rahul", conv: 9, leads: 76 },
];

const Reports = () => (
  <ModuleShell moduleId="reports">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Source-wise conversion"
        value="11.2%"
        onClick={() => toast.success("Source-wise conversion", { description: "Drill-down report (demo)" })}
      />
      <StatCard
        label="Stage funnel drop"
        value="C1→C1A 45%"
        onClick={() => toast.success("Stage funnel drop", { description: "C1 → C1A 45% · export CSV (demo)" })}
      />
      <StatCard
        label="SLA missed %"
        value="4.2%"
        onClick={() => toast.success("SLA missed %", { description: "4.2% of active leads · last 7 days" })}
      />
      <StatCard
        label="Campaign ROI"
        value="3.2x"
        onClick={() => toast.success("Campaign ROI", { description: "3.2x blended across Meta + Google" })}
      />
    </div>

    <Section title="Executive performance">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={execData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="conv" fill="hsl(217, 91%, 60%)" name="Conversion %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>

    <Section title="Report types">
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {["Lead source wise", "Stage wise funnel", "Executive performance", "Campaign ROI", "Lead aging", "Conversion %", "Lost by reason", "Dormant revived"].map((r) => (
          <li key={r}>
            <button
              type="button"
              onClick={() => toast.success(r, { description: "Report generated (demo)" })}
              className="w-full rounded-lg bg-secondary/30 px-3 py-2 text-left font-medium transition-colors hover:bg-secondary/50"
            >
              {r}
            </button>
          </li>
        ))}
      </ul>
    </Section>
  </ModuleShell>
);

export default Reports;
