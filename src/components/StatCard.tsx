import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  gradient: string;
}

const StatCard = ({ title, value, change, trend, icon: Icon, gradient }: Props) => {
  return (
    <div className="glass-card rounded-xl p-5 stat-shadow hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp size={14} className="text-success" />
            ) : (
              <TrendingDown size={14} className="text-destructive" />
            )}
            <span className={`text-xs font-semibold ${trend === "up" ? "text-success" : "text-destructive"}`}>
              {change}
            </span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={22} className="text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
