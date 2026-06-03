import {
  LayoutDashboard,
  UserPlus,
  MessageSquare,
  Landmark,
  ClipboardCheck,
  Truck,
  RefreshCw,
  Gauge,
  HeartPulse,
  Zap,
  GitBranch,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import zentroverseLogo from "@/assets/zentroverse-logo.png";
import { SIDEBAR_GROUPS, type FlowTabId } from "@/domain/flow-nav";
import { POSITIONING } from "@/domain/platform";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const DEFAULT_SIDEBAR_GROUP_HEADING = SIDEBAR_GROUPS[0].heading;

const navIdle =
  "text-[hsl(220,14%,92%)] hover:bg-[hsl(220,20%,18%)] hover:text-[hsl(0,0%,100%)]";
const navIconIdle = "text-[hsl(220,14%,88%)] group-hover:text-[hsl(0,0%,100%)]";
const navActive = "bg-[hsl(217,91%,52%)] text-white shadow-lg shadow-black/25 ring-1 ring-white/15";
const navIconActive = "text-white";

const TAB_ICONS: Record<FlowTabId, LucideIcon> = {
  dashboard: LayoutDashboard,
  c0: UserPlus,
  c1: MessageSquare,
  c1a: Landmark,
  c2: ClipboardCheck,
  c3: Truck,
  lifecycle: RefreshCw,
  scoring: Gauge,
  "contact-health": HeartPulse,
  action: Zap,
  workflow: GitBranch,
  analytics: BarChart3,
  notifications: Bell,
};

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const DashboardSidebar = ({ activeTab, onTabChange, collapsed, onCollapsedChange }: Props) => {
  const [openGroupHeading, setOpenGroupHeading] = useState<string | null>(DEFAULT_SIDEBAR_GROUP_HEADING);

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen max-h-screen flex-col border-r border-[hsl(220,20%,22%)] bg-[hsl(222,47%,11%)] shadow-xl shadow-black/30 transition-[width] duration-300 ease-out ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      <div className="relative shrink-0 border-b border-[hsl(220,20%,20%)]">
        {collapsed ? (
          <div className="flex items-center justify-center px-2 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-white/30">
              <img src={zentroverseLogo} alt={POSITIONING.name} className="h-8 w-8 object-contain" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-4">
            <div className="flex min-h-[72px] w-full max-w-[218px] items-center justify-center rounded-2xl bg-white px-4 py-3 shadow-md ring-1 ring-black/5">
              <img src={zentroverseLogo} alt={POSITIONING.name} className="max-h-[64px] w-full object-contain" />
            </div>
            {!collapsed && (
              <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-[hsl(220,14%,75%)]">
                {POSITIONING.name}
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="absolute right-0 top-1/2 z-[60] flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[hsl(220,20%,26%)] bg-[hsl(222,47%,13%)] text-[hsl(220,14%,85%)] shadow-lg hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="scrollbar-sidebar min-h-0 flex-1 space-y-1 overflow-y-auto px-2.5 py-4">
        {SIDEBAR_GROUPS.map((group) => {
          const renderItem = (item: (typeof group.items)[number]) => {
            const isActive = activeTab === item.id;
            const Icon = TAB_ICONS[item.id];
            return (
              <button
                key={item.navId ?? item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive ? navActive : navIdle
                }`}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? navIconActive : navIconIdle}`} />
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate text-[13px]">{item.label}</span>
                    {item.badge != null && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive ? "bg-white/20 text-white" : "bg-white/10 text-[hsl(220,14%,95%)]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          };

          if (collapsed) {
            return <div key={group.heading} className="space-y-1">{group.items.map(renderItem)}</div>;
          }

          return (
            <Collapsible
              key={group.heading}
              open={openGroupHeading === group.heading}
              onOpenChange={(open) => {
                if (open) setOpenGroupHeading(group.heading);
                else setOpenGroupHeading((h) => (h === group.heading ? null : h));
              }}
            >
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-[hsl(220,20%,16%)]"
              >
                <ChevronDown className="h-3.5 w-3.5 text-[hsl(220,12%,50%)] transition-transform group-data-[state=closed]:-rotate-90" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(220,12%,58%)]">
                  {group.heading}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 pb-3 pt-0.5">{group.items.map(renderItem)}</div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-[hsl(220,20%,20%)] px-2.5 py-3">
        <button type="button" className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${navIdle}`}>
          <Settings size={20} className={navIconIdle} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button type="button" className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(220,14%,92%)] hover:text-red-300">
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
