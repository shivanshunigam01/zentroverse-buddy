import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AppModuleId } from "@/domain/app-nav";
import { canAccessModule } from "@/domain/stages/stage-gates";
import { getZentroFlowStore } from "@/store/opportunity-store";
import {
  performOpportunityAction,
  confirmManualStageMove,
  type PerformActionOptions,
} from "@/services/opportunity-action.service";
import { triggerSmartfloIvrCall } from "@/api/smartflo.api";
import { ApiClientError } from "@/lib/api";

export type DashboardActions = {
  selectedLeadId?: string;
  navigate: (module: AppModuleId) => void;
  viewLead: (leadId: string) => void;
  runAction: (title: string, options?: { description?: string; navigateTo?: AppModuleId }) => void;
  /** Full workflow action — updates opportunity, engines, stage */
  performAction: (label: string, options?: PerformActionOptions) => Promise<void>;
  confirmStageMove: (
    opportunityId: string,
    form: { newStage: string; newAction: string; owner: string; reason?: string },
  ) => Promise<boolean>;
  callLead: (mobile: string, customerName?: string) => void;
  /** Smartflo IVR click-to-call via backend API */
  ivrCallLead: (mobile: string, customerName?: string, opportunityId?: string) => Promise<void>;
  openWhatsApp: (leadId?: string) => void;
  moveToStage: (stage: "C0" | "C1" | "C1A" | "C2" | "C3" | "lifecycle") => void;
  logout: () => void;
};

const DashboardContext = createContext<DashboardActions | null>(null);

const STAGE_MODULE: Record<string, AppModuleId> = {
  C0: "lead-inbox",
  C1: "sales-pipeline",
  C1A: "finance-desk",
  C2: "booking-billing",
  C3: "delivery-desk",
  lifecycle: "lifecycle-crm",
};

type ProviderProps = {
  children: ReactNode;
  activeModule: AppModuleId;
  selectedLeadId?: string;
  setActiveModule: (m: AppModuleId) => void;
  setSelectedLeadId: (id: string | undefined) => void;
  onMobileNavClose?: () => void;
};

export function DashboardProvider({
  children,
  selectedLeadId,
  setActiveModule,
  setSelectedLeadId,
  onMobileNavClose,
}: ProviderProps) {
  const routerNavigate = useNavigate();

  const navigate = useCallback(
    (module: AppModuleId) => {
      const access = canAccessModule(module, getZentroFlowStore().listOpportunities());
      if (!access.allowed) {
        toast.error("Module locked", { description: access.reason });
        return;
      }
      setActiveModule(module);
      onMobileNavClose?.();
    },
    [setActiveModule, onMobileNavClose],
  );

  const viewLead = useCallback(
    (leadId: string) => {
      setSelectedLeadId(leadId);
      setActiveModule("lead-detail");
      onMobileNavClose?.();
      toast.success("Lead opened", { description: leadId });
    },
    [setSelectedLeadId, setActiveModule, onMobileNavClose],
  );

  const runAction = useCallback(
    (title: string, options?: { description?: string; navigateTo?: AppModuleId }) => {
      toast.success(title, { description: options?.description ?? "Queued for backend sync (demo)" });
      if (options?.navigateTo) {
        setTimeout(() => navigate(options.navigateTo!), 400);
      }
    },
    [navigate],
  );

  const performAction = useCallback(
    (label: string, options?: PerformActionOptions) =>
      performOpportunityAction(
        label,
        { opportunityId: options?.opportunityId ?? selectedLeadId, ...options },
        navigate,
      ),
    [navigate, selectedLeadId],
  );

  const confirmStageMove = useCallback(
    (opportunityId: string, form: { newStage: string; newAction: string; owner: string; reason?: string }) =>
      confirmManualStageMove(opportunityId, form, navigate),
    [navigate],
  );

  const callLead = useCallback((mobile: string, customerName?: string) => {
    const tel = mobile.replace(/\s/g, "");
    window.open(`tel:${tel}`, "_self");
    toast.info(customerName ? `Calling ${customerName}` : "Opening dialer", { description: mobile });
  }, []);

  const ivrCallLead = useCallback(
    async (mobile: string, customerName?: string, opportunityId?: string) => {
      const toastId = toast.loading(
        customerName ? `Starting IVR call to ${customerName}…` : "Starting Smartflo IVR call…",
      );
      try {
        const result = await triggerSmartfloIvrCall({
          phoneNumber: mobile.replace(/\s/g, ""),
          customerName,
          opportunityId,
        });
        toast.success(result.message || "IVR call started", {
          id: toastId,
          description: `${result.phoneNumber}${result.ivrId ? ` · IVR ${result.ivrId}` : ""}`,
        });
      } catch (err) {
        toast.error("IVR call failed", {
          id: toastId,
          description: err instanceof ApiClientError ? err.message : "Could not reach Smartflo",
        });
      }
    },
    [],
  );

  const openWhatsApp = useCallback(
    (leadId?: string) => {
      void performOpportunityAction(
        "Send Bot Message",
        { opportunityId: leadId ?? selectedLeadId },
        navigate,
      );
    },
    [navigate, selectedLeadId],
  );

  const moveToStage = useCallback(
    (stage: keyof typeof STAGE_MODULE) => {
      const labels: Record<string, string> = {
        C0: "Move to C0",
        C1: "Move to C1",
        C1A: "Move to C1A",
        C2: "Move to C2",
        C3: "Move to C3",
        lifecycle: "Activate Lifecycle",
      };
      void performOpportunityAction(labels[stage] ?? stage, { opportunityId: selectedLeadId }, navigate);
    },
    [navigate, selectedLeadId],
  );

  const logout = useCallback(() => {
    toast.info("Signed out");
    routerNavigate("/");
  }, [routerNavigate]);

  const value = useMemo(
    () => ({
      selectedLeadId,
      navigate,
      viewLead,
      runAction,
      performAction,
      confirmStageMove,
      callLead,
      ivrCallLead,
      openWhatsApp,
      moveToStage,
      logout,
    }),
    [selectedLeadId, navigate, viewLead, runAction, performAction, confirmStageMove, callLead, ivrCallLead, openWhatsApp, moveToStage, logout],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardActions(): DashboardActions {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardActions must be used within DashboardProvider");
  return ctx;
}
