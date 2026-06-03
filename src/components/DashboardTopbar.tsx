import { useState } from "react";
import { toast } from "sonner";
import { Search, Bell, Menu } from "lucide-react";
import type { AppModuleId } from "@/domain/app-nav";
import { MODULE_TITLES } from "@/domain/app-nav";

interface Props {
  activeModule: AppModuleId;
  onMenuClick?: () => void;
  showMenu?: boolean;
}

const DashboardTopbar = ({ activeModule, onMenuClick, showMenu }: Props) => {
  const meta = MODULE_TITLES[activeModule];
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-lg">
      <div className="flex min-h-[4rem] items-center gap-3 px-4 sm:min-h-[4.25rem] sm:px-6 lg:px-8">
        {showMenu && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-border/80 bg-card hover:bg-secondary lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-bold sm:text-lg">{meta.title}</h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl hover:bg-secondary sm:hidden"
            aria-label="Search"
          >
            <Search size={20} className="text-muted-foreground" />
          </button>

          <div className="relative hidden sm:block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="search" placeholder="Search leads…" className="input-app w-44 py-2 pl-9 text-sm lg:w-56 xl:w-64" />
          </div>

          <button
            type="button"
            onClick={() =>
              toast.info("Notifications", {
                description: "3 SLA alerts · 2 finance pending · 1 delivery ready",
              })
            }
            className="relative flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl hover:bg-secondary"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
          </button>

          <button
            type="button"
            onClick={() => toast.success("Profile", { description: "Admin · ZentroFlow workspace" })}
            className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground shadow-md"
            aria-label="Account"
          >
            A
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border/60 px-4 pb-3 pt-2 sm:hidden">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="search" placeholder="Search leads…" className="input-app w-full py-2.5 pl-9 text-sm" autoFocus />
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardTopbar;
