import type { ReactNode } from "react";
import { Upload } from "lucide-react";
import { Btn } from "@/components/shared/ModuleShell";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";

const EmptyState = ({
  title,
  description,
  actionLabel = "Upload Excel",
  children,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  children?: ReactNode;
}) => {
  const { navigate } = useDashboardActions();
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Upload size={28} />
      </div>
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {children ?? (
        <Btn className="mt-6" onClick={() => navigate("lead-upload")}>
          {actionLabel}
        </Btn>
      )}
    </div>
  );
};

export default EmptyState;
