import {
  LayoutDashboard,
  Users,
  Bot,
  Brain,
  Phone,
  RefreshCw,
  Car,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  GitBranch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import zentroverseLogo from "@/assets/zentroverse-logo.png";
import { SIDEBAR_GROUPS, type FlowTabId } from "@/domain/flow-nav";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/** First group contains Dashboard — starts expanded; only one nav group open at a time. */
const DEFAULT_SIDEBAR_GROUP_HEADING = SIDEBAR_GROUPS[0].heading;

/** Explicit HSL — avoids UA `button` color + ensures icons (currentColor) match labels */
const navIdle =
  "text-[hsl(220,14%,92%)] hover:bg-[hsl(220,20%,18%)] hover:text-[hsl(0,0%,100%)]";
const navIconIdle = "text-[hsl(220,14%,88%)] group-hover:text-[hsl(0,0%,100%)]";
const navActive = "bg-[hsl(217,91%,52%)] text-white shadow-lg shadow-black/25 ring-1 ring-white/15";
const navIconActive = "text-white";

const TAB_ICONS: Record<FlowTabId, LucideIcon> = {
  dashboard: LayoutDashboard,
  leads: Users,
  engagement: Bot,
  classification: Brain,
  action: Phone,
  lifecycle: RefreshCw,
  vehicle: Car,
  workflow: GitBranch,
  monetization: Sparkles,
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
      {/* Logo — centered in tile; symmetric padding */}
      <div className="relative shrink-0 border-b border-[hsl(220,20%,20%)]">
        {collapsed ? (
          <div className="flex items-center justify-center px-2 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-white/30">
              <img
                src={zentroverseLogo}
                alt="ZENTROVERSE"
                className="h-8 w-8 object-contain object-center"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center px-4 py-4">
            <div className="flex min-h-[84px] w-full max-w-[218px] items-center justify-center rounded-2xl bg-white px-4 py-3 shadow-md ring-1 ring-black/5">
              <img
                src={zentroverseLogo}
                alt="ZENTROVERSE"
                className="max-h-[76px] w-full object-contain object-center"
                decoding="async"
              />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="absolute right-0 top-1/2 z-[60] flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[hsl(220,20%,26%)] bg-[hsl(222,47%,13%)] text-[hsl(220,14%,85%)] shadow-lg transition-colors hover:border-[hsl(217,91%,45%)] hover:bg-[hsl(220,20%,18%)] hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} strokeWidth={2.25} /> : <ChevronLeft size={14} strokeWidth={2.25} />}
        </button>
      </div>

      <nav className="scrollbar-sidebar min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2.5 py-4">
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
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
                  isActive ? navActive : navIdle
                }`}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${isActive ? navIconActive : navIconIdle}`}
                  strokeWidth={isActive ? 2.25 : 2}
                />
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge != null && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white/10 text-[hsl(220,14%,95%)] group-hover:bg-white/15 group-hover:text-white"
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
            return (
              <div key={group.heading} className="space-y-1">
                {group.items.map((item) => renderItem(item))}
              </div>
            );
          }

          return (
            <Collapsible
              key={group.heading}
              open={openGroupHeading === group.heading}
              onOpenChange={(open) => {
                if (open) setOpenGroupHeading(group.heading);
                else setOpenGroupHeading((h) => (h === group.heading ? null : h));
              }}
              className="group"
            >
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-[hsl(220,20%,16%)] focus-visible:ring-2 focus-visible:ring-sidebar-primary/50"
                aria-label={`Toggle ${group.heading} menu`}
              >
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[hsl(220,12%,50%)] transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(220,12%,58%)]">
                  {group.heading}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="space-y-1 pb-3 pt-0.5">{group.items.map((item) => renderItem(item))}</div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        <div className="h-2 shrink-0" aria-hidden />
      </nav>

      <div className="shrink-0 space-y-1 border-t border-[hsl(220,20%,20%)] px-2.5 py-3">
        <button
          type="button"
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${navIdle}`}
        >
          <Settings size={20} className={`shrink-0 ${navIconIdle}`} />
          {!collapsed && <span className="truncate">Settings</span>}
        </button>
        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[hsl(220,14%,92%)] transition-colors hover:bg-[hsl(220,20%,18%)] hover:text-red-300"
        >
          <LogOut size={20} className="shrink-0 text-[hsl(220,14%,88%)] group-hover:text-red-300" />
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
