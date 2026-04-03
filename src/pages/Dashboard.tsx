import { useState } from "react";
import { Users, Bot, Brain, Phone, TrendingUp, UserCheck } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import StatCard from "@/components/StatCard";
import LeadFunnel from "@/components/LeadFunnel";
import RecentLeads from "@/components/RecentLeads";
import EngineStatus from "@/components/EngineStatus";
import LifecycleTimeline from "@/components/LifecycleTimeline";
import LeadManagement from "@/components/modules/LeadManagement";
import AIEngagement from "@/components/modules/AIEngagement";
import AIClassification from "@/components/modules/AIClassification";
import ActionEngine from "@/components/modules/ActionEngine";
import LifecycleModule from "@/components/modules/LifecycleModule";
import VehicleCare from "@/components/modules/VehicleCare";
import AnalyticsDashboard from "@/components/modules/AnalyticsDashboard";
import NotificationsModule from "@/components/modules/NotificationsModule";

const stats = [
  { title: "Total Leads", value: "1,248", change: "+12.5%", trend: "up" as const, icon: Users, gradient: "gradient-primary" },
  { title: "AI Engaged", value: "986", change: "+8.3%", trend: "up" as const, icon: Bot, gradient: "gradient-success" },
  { title: "Conversions", value: "156", change: "+23.1%", trend: "up" as const, icon: UserCheck, gradient: "gradient-warning" },
  { title: "Revenue Impact", value: "₹2.4Cr", change: "+18.7%", trend: "up" as const, icon: TrendingUp, gradient: "gradient-primary" },
];

const DashboardHome = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <LeadFunnel />
        <RecentLeads />
      </div>
      <div className="space-y-6">
        <EngineStatus />
        <LifecycleTimeline />
      </div>
    </div>
  </div>
);

const moduleMap: Record<string, React.FC> = {
  dashboard: DashboardHome,
  leads: LeadManagement,
  engagement: AIEngagement,
  classification: AIClassification,
  action: ActionEngine,
  lifecycle: LifecycleModule,
  vehicle: VehicleCare,
  analytics: AnalyticsDashboard,
  notifications: NotificationsModule,
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const ActiveModule = moduleMap[activeTab] || DashboardHome;

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 ml-[260px] transition-all duration-300">
        <DashboardTopbar />
        <div className="p-6">
          <ActiveModule />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
