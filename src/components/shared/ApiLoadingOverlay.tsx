import { Loader2 } from "lucide-react";

type Props = {
  message: string;
};

/** Full-screen loader for slow API calls (import, validate, bootstrap). */
export function ApiLoadingOverlay({ message }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card px-10 py-8 shadow-lg">
        <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
        <p className="text-center text-sm font-medium text-foreground">{message}</p>
        <p className="text-center text-xs text-muted-foreground">Please wait — large files can take a minute.</p>
      </div>
    </div>
  );
}
