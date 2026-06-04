import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import { DashboardProvider } from "@/context/DashboardContext";
import { MOBILE_BREAKPOINT, useMediaQuery } from "@/hooks/use-media-query";
import type { AppModuleId } from "@/domain/app-nav";
import MainDashboard from "@/components/modules/MainDashboard";
import LeadUpload from "@/components/modules/LeadUpload";
import LeadInbox from "@/components/modules/LeadInbox";
import LeadDetail from "@/components/modules/LeadDetail";
import ActionEngineModule from "@/components/modules/ActionEngineModule";
import Autodialer from "@/components/modules/Autodialer";
import WhatsAppBot from "@/components/modules/WhatsAppBot";
import SalesPipeline from "@/components/modules/SalesPipeline";
import FinanceDesk from "@/components/modules/FinanceDesk";
import BookingBilling from "@/components/modules/BookingBilling";
import DeliveryDesk from "@/components/modules/DeliveryDesk";
import LifecycleCrm from "@/components/modules/LifecycleCrm";
import Reengagement from "@/components/modules/Reengagement";
import Reports from "@/components/modules/Reports";
import MastersSettings from "@/components/modules/MastersSettings";
import { useApiBootstrap } from "@/hooks/use-api-bootstrap";

const Dashboard = () => {
  const { syncing } = useApiBootstrap();
  const [activeModule, setActiveModule] = useState<AppModuleId>("lead-upload");
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  const sidebarW = isMobile ? 0 : collapsed ? 72 : 260;

  const closeMobileNav = () => setMobileNavOpen(false);

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <MainDashboard />;
      case "lead-upload":
        return <LeadUpload />;
      case "lead-inbox":
        return <LeadInbox />;
      case "lead-detail":
        return <LeadDetail leadId={selectedLeadId} />;
      case "action-engine":
        return <ActionEngineModule />;
      case "autodialer":
        return <Autodialer />;
      case "whatsapp-bot":
        return <WhatsAppBot />;
      case "sales-pipeline":
        return <SalesPipeline />;
      case "finance-desk":
        return <FinanceDesk />;
      case "booking-billing":
        return <BookingBilling />;
      case "delivery-desk":
        return <DeliveryDesk />;
      case "lifecycle-crm":
        return <LifecycleCrm />;
      case "re-engagement":
        return <Reengagement />;
      case "reports":
        return <Reports />;
      case "masters":
        return <MastersSettings />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <DashboardProvider
      activeModule={activeModule}
      selectedLeadId={selectedLeadId}
      setActiveModule={setActiveModule}
      setSelectedLeadId={setSelectedLeadId}
      onMobileNavClose={closeMobileNav}
    >
      <div className="min-h-screen bg-app">
        <DashboardSidebar
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          isMobile={isMobile}
          mobileOpen={mobileNavOpen}
          onMobileClose={closeMobileNav}
        />
        <main
          className="relative z-10 min-w-0 overflow-x-hidden transition-[margin] duration-300 ease-out"
          style={{ marginLeft: sidebarW }}
        >
          <DashboardTopbar
            activeModule={activeModule}
            onMenuClick={() => setMobileNavOpen(true)}
            showMenu={isMobile}
          />
          <div className="page-content">
            {syncing ? (
              <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
                Syncing with API…
              </div>
            ) : (
              renderModule()
            )}
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
};

export default Dashboard;
