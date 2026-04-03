import { Search, Bell, MessageSquare } from "lucide-react";
import type { FlowTabId } from "@/domain/flow-nav";
import { MODULE_META } from "@/domain/flow-nav";

interface Props {
  activeTab: string;
}

const DashboardTopbar = ({ activeTab }: Props) => {
  const meta = MODULE_META[activeTab as FlowTabId] ?? MODULE_META.dashboard;

  return (
    <header className="sticky top-0 z-40 flex h-[4.25rem] max-w-[100vw] items-center justify-between overflow-x-hidden border-b border-border/80 bg-card/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="min-w-0 pr-4">
        <h1 className="text-base lg:text-lg font-bold text-foreground font-display truncate">{meta.title}</h1>
        <p className="text-xs text-muted-foreground truncate">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search leads, customers…"
            className="input-app pl-9 pr-4 py-2 text-sm w-52 lg:w-64"
          />
        </div>

        <button
          type="button"
          className="relative flex min-h-10 min-w-10 touch-manipulation items-center justify-center rounded-xl border border-transparent p-2 transition-all hover:border-border/80 hover:bg-secondary active:scale-95"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>

        <button
          type="button"
          className="relative hidden min-h-10 min-w-10 touch-manipulation items-center justify-center rounded-xl border border-transparent p-2 transition-all hover:border-border/80 hover:bg-secondary active:scale-95 sm:flex"
          aria-label="Messages"
        >
          <MessageSquare size={20} className="text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-success ring-2 ring-card" />
        </button>

        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
          A
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
