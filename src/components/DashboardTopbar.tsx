import { Search, Bell, MessageSquare } from "lucide-react";

const DashboardTopbar = () => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Welcome back, Admin</h1>
        <p className="text-xs text-muted-foreground">Here's what's happening with your leads today</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads, customers..."
            className="pl-9 pr-4 py-2 text-sm bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-primary/30 w-64 placeholder:text-muted-foreground"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
        </button>

        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <MessageSquare size={20} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-success" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
          A
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
