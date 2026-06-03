import {
  LayoutDashboard,
  Upload,
  Inbox,
  FileSearch,
  Zap,
  Phone,
  MessageCircle,
  TrendingUp,
  Landmark,
  ClipboardCheck,
  Truck,
  RefreshCw,
  RotateCcw,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import zentroverseLogo from "@/assets/zentroverse-logo.png";
import { MAIN_SIDEBAR, type AppModuleId } from "@/domain/app-nav";
import { POSITIONING } from "@/domain/platform";

const MODULE_ICONS: Record<AppModuleId, LucideIcon> = {
  dashboard: LayoutDashboard,
  "lead-upload": Upload,
  "lead-inbox": Inbox,
  "lead-detail": FileSearch,
  "action-engine": Zap,
  autodialer: Phone,
  "whatsapp-bot": MessageCircle,
  "sales-pipeline": TrendingUp,
  "finance-desk": Landmark,
  "booking-billing": ClipboardCheck,
  "delivery-desk": Truck,
  "lifecycle-crm": RefreshCw,
  "re-engagement": RotateCcw,
  reports: BarChart3,
  masters: Settings,
};

const navIdle = "text-[hsl(220,14%,92%)] hover:bg-[hsl(220,20%,18%)] hover:text-white active:bg-[hsl(220,20%,22%)]";
const navActive = "bg-[hsl(217,91%,52%)] text-white shadow-lg ring-1 ring-white/15";

interface Props {
  activeModule: AppModuleId;
  onModuleChange: (id: AppModuleId) => void;
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const DashboardSidebar = ({
  activeModule,
  onModuleChange,
  collapsed,
  onCollapsedChange,
  isMobile,
  mobileOpen,
  onMobileClose,
}: Props) => {
  const expanded = isMobile || !collapsed;
  const width = isMobile ? 280 : collapsed ? 72 : 260;

  return (
    <>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[70] flex h-[100dvh] flex-col border-r border-[hsl(220,20%,22%)] bg-[hsl(222,47%,11%)] shadow-2xl transition-transform duration-300 ease-out ${
          isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        }`}
        style={{ width }}
      >
        <div className="relative shrink-0 border-b border-[hsl(220,20%,20%)] px-3 py-4">
          <div className={`flex ${expanded ? "flex-col items-center" : "justify-center"}`}>
            <div
              className={`flex items-center justify-center rounded-xl bg-white shadow-md ${
                expanded ? "min-h-[72px] w-full max-w-[218px] px-4 py-3" : "h-11 w-11"
              }`}
            >
              <img
                src={zentroverseLogo}
                alt={POSITIONING.name}
                className={`object-contain ${expanded ? "max-h-[64px] w-full" : "h-8 w-8"}`}
              />
            </div>
            {expanded && (
              <>
                <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-[hsl(220,14%,75%)]">
                  {POSITIONING.name}
                </p>
                <p className="text-center text-[9px] text-[hsl(220,12%,55%)]">Automotive revenue lifecycle</p>
              </>
            )}
          </div>

          {isMobile ? (
            <button
              type="button"
              onClick={onMobileClose}
              className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(220,14%,85%)] hover:bg-[hsl(220,20%,18%)] hover:text-white"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onCollapsedChange(!collapsed)}
              className="absolute right-0 top-1/2 flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-[hsl(222,47%,13%)] text-[hsl(220,14%,85%)] shadow-lg hover:text-white"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        <nav className="scrollbar-sidebar min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          {expanded && (
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(220,12%,52%)]">Main menu</p>
          )}
          <div className="space-y-0.5">
            {MAIN_SIDEBAR.map((item) => {
              const Icon = MODULE_ICONS[item.id];
              const active = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onModuleChange(item.id)}
                  title={!expanded ? item.label : undefined}
                  className={`flex w-full min-h-11 touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    active ? navActive : navIdle
                  }`}
                >
                  <Icon size={20} className="shrink-0" strokeWidth={active ? 2.25 : 2} />
                  {expanded && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-[13px]">{item.label}</span>
                      {item.badge != null && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${active ? "bg-white/20" : "bg-white/10"}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-[hsl(220,20%,20%)] px-2 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button type="button" className={`flex w-full min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${navIdle}`}>
            <LogOut size={20} />
            {expanded && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
