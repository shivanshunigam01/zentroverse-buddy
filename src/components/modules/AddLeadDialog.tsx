import { useRef, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Btn } from "@/components/shared/ModuleShell";
import { ApiClientError } from "@/lib/api";
import { isValidMobile } from "@/lib/mobile";
import { createLead } from "@/api/leads.api";
import { getCurrentUserName } from "@/api/auth.api";
import { persistLeadFromApiDto } from "@/services/sync.service";

type Props = {
  onCreated?: (opportunityId: string) => void;
};

export function AddLeadDialog({ onCreated }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    const str = (key: string) => String(fd.get(key) ?? "").trim();
    const mobile = str("mobile");
    const customerName = str("customerName");

    if (!mobile) {
      toast.error("Mobile number is required");
      return;
    }
    if (!isValidMobile(mobile)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!customerName) {
      toast.error("Customer name is required");
      return;
    }

    setSaving(true);
    try {
      const dto = await createLead({
        customerName,
        mobile,
        product: str("product") || "General",
        requirement: str("requirement"),
        district: str("district"),
        source: str("source") || "Manual Entry",
        branch: str("branch") || "Default Branch",
        executive: str("executive") || getCurrentUserName(),
        email: str("email"),
      });
      persistLeadFromApiDto(dto as unknown as Record<string, unknown>);
      toast.success("Lead created", {
        description: `${customerName} added at stage C0.1`,
      });
      setOpen(false);
      formRef.current?.reset();
      onCreated?.(dto.opportunity_id);
    } catch (err) {
      toast.error("Could not create lead", {
        description: err instanceof ApiClientError ? err.message : "Please check the form and try again",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Btn onClick={() => setOpen(true)}>
        <span className="inline-flex items-center gap-2">
          <UserPlus className="h-4 w-4" aria-hidden />
          Add Lead
        </span>
      </Btn>

      <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" aria-hidden />
              Add new lead
            </DialogTitle>
            <DialogDescription>
              Create a lead manually. It starts at C0.1 Contact, same as Excel import. Mobile must be a
              valid Indian number.
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer name *" name="customerName" placeholder="Full name" required />
              <Field label="Mobile *" name="mobile" placeholder="10-digit mobile" required inputMode="tel" />
              <Field label="Product" name="product" placeholder="General" defaultValue="General" />
              <Field label="Requirement" name="requirement" placeholder="Optional notes" />
              <Field label="District / address" name="district" placeholder="City or area" />
              <Field label="Source" name="source" placeholder="Manual Entry" defaultValue="Manual Entry" />
              <Field label="Branch" name="branch" placeholder="Default Branch" defaultValue="Default Branch" />
              <Field label="Executive" name="executive" placeholder={getCurrentUserName()} />
              <Field label="Email" name="email" type="email" placeholder="Optional" className="sm:col-span-2" />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Btn type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>
                Cancel
              </Btn>
              <Btn type="submit" disabled={saving}>
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </span>
                ) : (
                  "Create lead"
                )}
              </Btn>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
  required,
  type = "text",
  inputMode,
  className,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name} className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="mt-1.5"
      />
    </div>
  );
}
