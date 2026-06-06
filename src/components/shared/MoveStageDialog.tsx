import { useRef } from "react";
import { toast } from "sonner";
import { Btn } from "@/components/shared/ModuleShell";
import type { Lead } from "@/domain/leads";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import {
  STAGE_SELECT_GROUPS,
  formatStageOptionLabel,
} from "@/domain/stages/business-stages";

type Props = {
  open: boolean;
  lead: Lead;
  onClose: () => void;
  onConfirm: () => void;
};

const MoveStageDialog = ({ open, lead, onClose, onConfirm }: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { confirmStageMove } = useDashboardActions();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    const newStage = String(fd.get("newStage") ?? "").trim();
    const newAction = String(fd.get("newAction") ?? "").trim();
    const owner = String(fd.get("owner") ?? "").trim();
    const reason = String(fd.get("reason") ?? "").trim();

    if (!newStage || !newAction || !owner) {
      toast.error("Required fields missing", {
        description: "New stage, new action, and owner are required",
      });
      return;
    }

    const ok = await confirmStageMove(lead.opportunityId, {
      newStage,
      newAction,
      owner,
      reason: reason || undefined,
    });
    if (ok) onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-stage-title"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
        <h2 id="move-stage-title" className="font-display text-lg font-bold sm:text-xl">
          Move Stage
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose the target micro stage from the list below.
        </p>

        <div className="mt-5 space-y-4 text-sm">
          <Row label="Current stage" value={`${lead.currentStage} · ${lead.microStage}`} />
          <StageSelect name="newStage" label="New stage" required />
          <Field name="reason" label="Reason" placeholder="Why moving stage" />
          <Row label="Current action" value={lead.currentAction} />
          <Field name="newAction" label="New action" placeholder="Required" required />
          <Field name="owner" label="Owner" placeholder="Required — single owner" defaultValue={lead.currentOwner} required />
          <Field name="nextActionAt" label="Next action date" type="datetime-local" />
          <Field name="remarks" label="Remarks" placeholder="Optional notes" />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <Btn type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Btn>
          <Btn type="submit" fullWidth>
            Confirm Move
          </Btn>
        </div>
      </form>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-secondary/40 px-3 py-2.5">
    <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
    <p className="mt-0.5 font-medium text-foreground">{value}</p>
  </div>
);

const StageSelect = ({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={name} className="text-[10px] font-bold uppercase text-muted-foreground">
      {label}
      {required && <span className="text-destructive"> *</span>}
    </label>
    <select
      id={name}
      name={name}
      required={required}
      defaultValue=""
      className="input-app mt-1.5 w-full px-3 py-2.5 text-sm"
    >
      <option value="" disabled>
        Select a stage…
      </option>
      {STAGE_SELECT_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.stages.map((stage) => {
            const optionLabel = formatStageOptionLabel(stage);
            return (
              <option key={stage.code} value={optionLabel}>
                {optionLabel}
              </option>
            );
          })}
        </optgroup>
      ))}
    </select>
  </div>
);

const Field = ({
  name,
  label,
  placeholder,
  defaultValue,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={name} className="text-[10px] font-bold uppercase text-muted-foreground">
      {label}
      {required && <span className="text-destructive"> *</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      className="input-app mt-1.5 w-full px-3 py-2.5 text-sm"
    />
  </div>
);

export default MoveStageDialog;
