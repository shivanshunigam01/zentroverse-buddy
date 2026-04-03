import { useState } from "react";
import {
  LayoutDashboard, Users, Bot, Brain, Phone, RefreshCw, Car, BarChart3,
  Bell, Settings, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import zentroverseLogo from "@/assets/zentroverse-logo.png";

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "Lead Management", id: "leads", badge: 142 },
  { icon: Bot, label: "AI Engagement", id: "engagement" },
  { icon: Brain, label: "AI Classification", id: "classification" },
  { icon: Phone, label: "Action Engine", id: "action", badge: 23 },
  { icon: RefreshCw, label: "Lifecycle", id: "lifecycle" },
  { icon: Car, label: "Vehicle Care", id: "vehicle" },
  { icon: BarChart3, label: "Analytics", id: "analytics" },
  { icon: Bell, label: "Notifications", id: "notifications", badge: 8 },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab, onTabChange }: Props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <img src={zentroverseLogo} alt="Zentroverse" className="h-8 w-auto" />
        {!collapsed && (
          <span className="text-sidebar-foreground font-bold text-lg tracking-tight">
            Zentroverse
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground"
              }`}
            >
              <item.icon size={20} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-sidebar-accent/20 text-sidebar-accent"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground transition-all">
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-destructive transition-all">
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:shadow-md transition-all"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default DashboardSidebar;
