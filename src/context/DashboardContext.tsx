import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AppModuleId } from "@/domain/app-nav";

export type DashboardActions = {
  navigate: (module: AppModuleId) => void;
  viewLead: (leadId: string) => void;
  /** Simulated action — toast + optional navigation (backend will replace this) */
  runAction: (title: string, options?: { description?: string; navigateTo?: AppModuleId }) => void;
  callLead: (mobile: string, customerName?: string) => void;
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
  setActiveModule: (m: AppModuleId) => void;
  setSelectedLeadId: (id: string | undefined) => void;
  onMobileNavClose?: () => void;
};

export function DashboardProvider({
  children,
  setActiveModule,
  setSelectedLeadId,
  onMobileNavClose,
}: ProviderProps) {
  const routerNavigate = useNavigate();

  const navigate = useCallback(
    (module: AppModuleId) => {
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

  const callLead = useCallback((mobile: string, customerName?: string) => {
    const tel = mobile.replace(/\s/g, "");
    window.open(`tel:${tel}`, "_self");
    toast.info(customerName ? `Calling ${customerName}` : "Opening dialer", { description: mobile });
  }, []);

  const openWhatsApp = useCallback(
    (leadId?: string) => {
      navigate("whatsapp-bot");
      toast.success("WhatsApp Bot", {
        description: leadId ? `Journey for ${leadId}` : "Bot engagement module",
      });
    },
    [navigate],
  );

  const moveToStage = useCallback(
    (stage: keyof typeof STAGE_MODULE) => {
      const mod = STAGE_MODULE[stage];
      if (mod) navigate(mod);
      toast.success(`Moved to ${stage}`, { description: "Stage transition recorded (demo)" });
    },
    [navigate],
  );

  const logout = useCallback(() => {
    toast.info("Signed out");
    routerNavigate("/");
  }, [routerNavigate]);

  const value = useMemo(
    () => ({ navigate, viewLead, runAction, callLead, openWhatsApp, moveToStage, logout }),
    [navigate, viewLead, runAction, callLead, openWhatsApp, moveToStage, logout],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardActions(): DashboardActions {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardActions must be used within DashboardProvider");
  return ctx;
}
