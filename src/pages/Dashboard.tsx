import { useState, useEffect } from "react";
import { Users, Bot, Brain, Phone, TrendingUp, UserCheck } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import StatCard from "@/components/StatCard";
import LeadFunnel from "@/components/LeadFunnel";
import RecentLeads from "@/components/RecentLeads";
import EngineStatus from "@/components/EngineStatus";
import LifecycleTimeline from "@/components/LifecycleTimeline";
import MasterFlow from "@/components/MasterFlow";
import PageHeader from "@/components/layout/PageHeader";
import LeadManagement from "@/components/modules/LeadManagement";
import AIEngagement from "@/components/modules/AIEngagement";
import AIClassification from "@/components/modules/AIClassification";
import ActionEngine from "@/components/modules/ActionEngine";
import LifecycleModule from "@/components/modules/LifecycleModule";
import VehicleCare from "@/components/modules/VehicleCare";
import AnalyticsDashboard from "@/components/modules/AnalyticsDashboard";
import NotificationsModule from "@/components/modules/NotificationsModule";
import WorkflowAutomation from "@/components/modules/WorkflowAutomation";
import NonInterestedMonetization from "@/components/modules/NonInterestedMonetization";
import type { FlowTabId } from "@/domain/flow-nav";

const stats = [
  { title: "Total Leads", value: "1,248", change: "+12.5%", trend: "up" as const, icon: Users, gradient: "gradient-primary" },
  { title: "AI Engaged", value: "986", change: "+8.3%", trend: "up" as const, icon: Bot, gradient: "gradient-success" },
  { title: "Conversions", value: "156", change: "+23.1%", trend: "up" as const, icon: UserCheck, gradient: "gradient-warning" },
  { title: "Revenue Impact", value: "₹2.4Cr", change: "+18.7%", trend: "up" as const, icon: TrendingUp, gradient: "gradient-primary" },
];

const DashboardHome = ({ onNavigate }: { onNavigate: (t: FlowTabId) => void }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
    <MasterFlow onNavigate={onNavigate} />
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
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

const moduleMap: Record<string, React.FC> = {
  leads: LeadManagement,
  engagement: AIEngagement,
  classification: AIClassification,
  action: ActionEngine,
  lifecycle: LifecycleModule,
  vehicle: VehicleCare,
  analytics: AnalyticsDashboard,
  notifications: NotificationsModule,
  workflow: WorkflowAutomation,
  monetization: NonInterestedMonetization,
};

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
        className="relative z-10 flex-1 min-w-0 max-w-[100vw] overflow-x-hidden transition-[margin] duration-300 ease-out"
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
