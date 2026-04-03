import { useState } from "react";
import { Users, Bot, Brain, Phone, TrendingUp, UserCheck } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import StatCard from "@/components/StatCard";
import LeadFunnel from "@/components/LeadFunnel";
import RecentLeads from "@/components/RecentLeads";
import EngineStatus from "@/components/EngineStatus";
import LifecycleTimeline from "@/components/LifecycleTimeline";

const stats = [
  { title: "Total Leads", value: "1,248", change: "+12.5%", trend: "up" as const, icon: Users, gradient: "gradient-primary" },
  { title: "AI Engaged", value: "986", change: "+8.3%", trend: "up" as const, icon: Bot, gradient: "gradient-success" },
  { title: "Conversions", value: "156", change: "+23.1%", trend: "up" as const, icon: UserCheck, gradient: "gradient-warning" },
  { title: "Revenue Impact", value: "₹2.4Cr", change: "+18.7%", trend: "up" as const, icon: TrendingUp, gradient: "gradient-primary" },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 ml-[260px] transition-all duration-300">
        <DashboardTopbar />
        
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Main grid */}
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
      </main>
    </div>
  );
};

export default Dashboard;
