import { Btn } from "@/components/shared/ModuleShell";
import type { Lead } from "@/domain/leads";

type Props = {
  open: boolean;
  lead: Lead;
  onClose: () => void;
  onConfirm: () => void;
};

const MoveStageDialog = ({ open, lead, onClose, onConfirm }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-stage-title"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
        <h2 id="move-stage-title" className="font-display text-lg font-bold sm:text-xl">Move Stage</h2>
        <p className="mt-1 text-xs text-muted-foreground">Stage, action, owner, next action, and SLA are required</p>

        <div className="mt-5 space-y-4 text-sm">
          <Row label="Current stage" value={`${lead.currentStage} · ${lead.microStage}`} />
          <Field label="New stage" placeholder="e.g. C1 · C1.3 Objection Captured" />
          <Field label="Reason" placeholder="Why moving stage" />
          <Row label="Current action" value={lead.currentAction} />
          <Field label="New action" placeholder="Required" required />
          <Field label="Owner" placeholder="Required — single owner" defaultValue={lead.currentOwner} required />
          <Field label="Next action date" type="datetime-local" />
          <Field label="Remarks" placeholder="Optional notes" />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <Btn variant="outline" onClick={onClose} fullWidth>Cancel</Btn>
          <Btn onClick={onConfirm} fullWidth>Confirm Move</Btn>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-secondary/40 px-3 py-2.5">
    <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
    <p className="mt-0.5 font-medium text-foreground">{value}</p>
  </div>
);

const Field = ({
  label,
  placeholder,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) => (
  <div>
    <label className="text-[10px] font-bold uppercase text-muted-foreground">
      {label}{required && <span className="text-destructive"> *</span>}
    </label>
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      className="input-app mt-1.5 w-full px-3 py-2.5 text-sm"
    />
  </div>
);

export default MoveStageDialog;
