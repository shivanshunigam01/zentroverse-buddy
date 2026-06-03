import { useState, useEffect } from "react";
import { Users, Gauge, Zap, Truck, TrendingUp } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import StatCard from "@/components/StatCard";
import LeadFunnel from "@/components/LeadFunnel";
import RecentLeads from "@/components/RecentLeads";
import EngineStatus from "@/components/EngineStatus";
import LifecycleTimeline from "@/components/LifecycleTimeline";
import MasterFlow from "@/components/MasterFlow";
import PageHeader from "@/components/layout/PageHeader";
import LeadBackboneCard from "@/components/shared/LeadBackboneCard";
import C0LeadMaturity from "@/components/modules/C0LeadMaturity";
import C1SalesDiscussion from "@/components/modules/C1SalesDiscussion";
import C1AFinance from "@/components/modules/C1AFinance";
import C2BookingBilling from "@/components/modules/C2BookingBilling";
import C3RetailDelivery from "@/components/modules/C3RetailDelivery";
import LifecycleRevenue from "@/components/modules/LifecycleRevenue";
import ScoringEngine from "@/components/modules/ScoringEngine";
import ContactHealthModule from "@/components/modules/ContactHealthModule";
import ActionEngine from "@/components/modules/ActionEngine";
import AnalyticsDashboard from "@/components/modules/AnalyticsDashboard";
import NotificationsModule from "@/components/modules/NotificationsModule";
import WorkflowAutomation from "@/components/modules/WorkflowAutomation";
import type { FlowTabId } from "@/domain/flow-nav";

const stats = [
  { title: "In C0 (Maturity)", value: "1,248", change: "+12.5%", trend: "up" as const, icon: Users, gradient: "gradient-primary" },
  { title: "In C1–C1A (Sales/Finance)", value: "412", change: "+8.3%", trend: "up" as const, icon: Gauge, gradient: "gradient-success" },
  { title: "In C2–C3 (Booking/Delivery)", value: "165", change: "+23.1%", trend: "up" as const, icon: Truck, gradient: "gradient-warning" },
  { title: "Action queue (open)", value: "89", change: "4 SLA risk", trend: "up" as const, icon: Zap, gradient: "gradient-primary" },
  { title: "Lifecycle active", value: "2.1K", change: "+18.7%", trend: "up" as const, icon: TrendingUp, gradient: "gradient-success" },
];

const moduleMap: Record<string, React.FC> = {
  c0: C0LeadMaturity,
  c1: C1SalesDiscussion,
  c1a: C1AFinance,
  c2: C2BookingBilling,
  c3: C3RetailDelivery,
  lifecycle: LifecycleRevenue,
  scoring: ScoringEngine,
  "contact-health": ContactHealthModule,
  action: ActionEngine,
  workflow: WorkflowAutomation,
  analytics: AnalyticsDashboard,
  notifications: NotificationsModule,
};

const DashboardHome = ({ onNavigate }: { onNavigate: (t: FlowTabId) => void }) => (
  <div className="space-y-8">
    <LeadBackboneCard />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
    <MasterFlow onNavigate={onNavigate} />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
      <div className="xl:col-span-2 space-y-6 lg:space-y-8">
        <LeadFunnel />
        <RecentLeads />
      </div>
      <div className="space-y-6 lg:space-y-8">
        <EngineStatus />
        <LifecycleTimeline />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const sidebarW = collapsed ? 72 : 260;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const go = (t: FlowTabId) => setActiveTab(t);
  const ActiveModule = moduleMap[activeTab];

  return (
    <div className="min-h-screen bg-app flex">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <main
        className="relative z-10 flex-1 min-w-0 max-w-[100vw] overflow-x-hidden transition-[margin] duration-300"
        style={{ marginLeft: sidebarW }}
      >
        <DashboardTopbar activeTab={activeTab} />
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {activeTab === "dashboard" ? (
            <DashboardHome onNavigate={go} />
          ) : (
            <>
              <PageHeader activeTab={activeTab as FlowTabId} onNavigate={go} />
              {ActiveModule ? <ActiveModule /> : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
