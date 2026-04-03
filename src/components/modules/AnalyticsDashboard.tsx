import { BarChart3, TrendingUp, Users, Bot, Phone, Target, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

const kpis = [
  { label: "Conversion Rate", value: "12.5%", change: "+2.3%", trend: "up", icon: Target },
  { label: "Response Rate", value: "79%", change: "+5.1%", trend: "up", icon: Bot },
  { label: "Avg. Response Time", value: "4.2 min", change: "-1.3 min", trend: "up", icon: Phone },
  { label: "Revenue from Lifecycle", value: "₹44.4L", change: "+18%", trend: "up", icon: DollarSign },
];

const sourcePerformance = [
  { source: "Meta Ads", leads: 456, converted: 67, rate: "14.7%", spend: "₹2.4L", cpl: "₹526" },
  { source: "Google Ads", leads: 312, converted: 38, rate: "12.2%", spend: "₹1.8L", cpl: "₹577" },
  { source: "Website", leads: 198, converted: 28, rate: "14.1%", spend: "₹0", cpl: "₹0" },
  { source: "Walk-in", leads: 156, converted: 34, rate: "21.8%", spend: "₹0", cpl: "₹0" },
  { source: "Referral", leads: 89, converted: 22, rate: "24.7%", spend: "₹0", cpl: "₹0" },
  { source: "Field Team", leads: 37, converted: 5, rate: "13.5%", spend: "₹0.8L", cpl: "₹2,162" },
];

const engagementScores = [
  { segment: "New Vehicle Buyers (0-3 months)", score: 92, customers: 234 },
  { segment: "Active Service Users (3-12 months)", score: 78, customers: 456 },
  { segment: "Dormant Customers (12+ months)", score: 34, customers: 189 },
  { segment: "High-Value Repeat Buyers", score: 96, customers: 67 },
];

const AnalyticsDashboard = () => {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Performance & insights • Last 30 days</p>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="surface-card p-5 lg:p-6 stat-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === "up" ? <ArrowUpRight size={14} className="text-success" /> : <ArrowDownRight size={14} className="text-destructive" />}
                  <span className="text-xs font-semibold text-success">{kpi.change}</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center">
                <kpi.icon size={20} className="text-primary-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Source Performance */}
        <div className="surface-card p-6 lg:p-7">
          <h3 className="text-base font-bold text-foreground mb-4">Lead Source Performance</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 font-semibold text-muted-foreground">Source</th>
                <th className="text-left pb-2 font-semibold text-muted-foreground">Leads</th>
                <th className="text-left pb-2 font-semibold text-muted-foreground">Conv.</th>
                <th className="text-left pb-2 font-semibold text-muted-foreground">Rate</th>
                <th className="text-left pb-2 font-semibold text-muted-foreground">CPL</th>
              </tr>
            </thead>
            <tbody>
              {sourcePerformance.map((s, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-2.5 font-semibold text-foreground">{s.source}</td>
                  <td className="py-2.5 text-foreground">{s.leads}</td>
                  <td className="py-2.5 text-foreground">{s.converted}</td>
                  <td className="py-2.5"><span className="text-success font-semibold">{s.rate}</span></td>
                  <td className="py-2.5 text-muted-foreground">{s.cpl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Engagement Score */}
        <div className="surface-card p-6 lg:p-7">
          <h3 className="text-base font-bold text-foreground mb-4">Customer Engagement Score</h3>
          <div className="space-y-4">
            {engagementScores.map((seg, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{seg.segment}</span>
                  <span className="text-sm font-bold text-foreground">{seg.score}/100</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden mb-1">
                  <div className={`h-full rounded-full ${seg.score >= 80 ? "gradient-success" : seg.score >= 50 ? "gradient-warning" : "gradient-danger"}`} style={{ width: `${seg.score}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">{seg.customers} customers</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
