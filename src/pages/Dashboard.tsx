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
import CrmDashboard from "@/components/modules/crm/CrmDashboard";
import CrmLeadList from "@/components/modules/crm/CrmLeadList";
import CrmLead360 from "@/components/modules/crm/CrmLead360";
import CrmCustomers from "@/components/modules/crm/CrmCustomers";
import CrmFollowups from "@/components/modules/crm/CrmFollowups";
import CrmSettings from "@/components/modules/crm/CrmSettings";
import CrmJourneyList from "@/components/modules/crm/CrmJourneyList";
import { fetchCrmTestDrives, fetchCrmQuotations, fetchCrmBookings, fetchCrmRetail, fetchCrmLeads } from "@/api/crm.api";
import { useCrmStore } from "@/store/crm-store";
import { useApiBootstrap } from "@/hooks/use-api-bootstrap";

const Dashboard = () => {
  const { syncing } = useApiBootstrap();
  const setSelectedCrmLeadId = useCrmStore((s) => s.setSelectedLeadId);
  const selectedCrmLeadId = useCrmStore((s) => s.selectedLeadId);
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
      case "crm-dashboard":
        return <CrmDashboard />;
      case "crm-leads":
        return (
          <CrmLeadList
            onViewLead={(id) => {
              setSelectedCrmLeadId(id);
              setActiveModule("crm-lead-detail");
            }}
          />
        );
      case "crm-lead-detail":
        return <CrmLead360 leadId={selectedCrmLeadId ?? undefined} />;
      case "crm-customers":
        return <CrmCustomers />;
      case "crm-followups":
        return <CrmFollowups />;
      case "crm-settings":
        return <CrmSettings />;
      case "crm-test-drives":
        return (
          <CrmJourneyList
            moduleId="crm-test-drives"
            title="Test Drives"
            fetchList={fetchCrmTestDrives}
            columns={[
              { key: "test_drive_id", label: "ID" },
              { key: "lead_id", label: "Lead" },
              { key: "product", label: "Product" },
              { key: "scheduled_date", label: "Date" },
              { key: "status", label: "Status" },
            ]}
          />
        );
      case "crm-quotations":
        return (
          <CrmJourneyList
            moduleId="crm-quotations"
            title="Quotations"
            fetchList={fetchCrmQuotations}
            columns={[
              { key: "quotation_id", label: "ID" },
              { key: "lead_id", label: "Lead" },
              { key: "product", label: "Product" },
              { key: "amount", label: "Amount" },
              { key: "status", label: "Status" },
            ]}
          />
        );
      case "crm-bookings":
        return (
          <CrmJourneyList
            moduleId="crm-bookings"
            title="Bookings"
            fetchList={fetchCrmBookings}
            columns={[
              { key: "booking_id", label: "ID" },
              { key: "lead_id", label: "Lead" },
              { key: "product", label: "Product" },
              { key: "booking_date", label: "Date" },
              { key: "status", label: "Status" },
            ]}
          />
        );
      case "crm-retail":
        return (
          <CrmJourneyList
            moduleId="crm-retail"
            title="Retail"
            fetchList={fetchCrmRetail}
            columns={[
              { key: "retail_id", label: "ID" },
              { key: "lead_id", label: "Lead" },
              { key: "product", label: "Product" },
              { key: "retail_date", label: "Date" },
              { key: "delivery_status", label: "Delivery" },
            ]}
          />
        );
      case "crm-lost-leads":
        return (
          <CrmJourneyList
            moduleId="crm-lost-leads"
            title="Lost Leads"
            fetchList={async (params) => {
              const result = await fetchCrmLeads({ ...params, status: "Lost" });
              return { data: result.data as unknown as Array<Record<string, unknown>>, meta: result.meta };
            }}
            columns={[
              { key: "lead_id", label: "Lead ID" },
              { key: "customer_name", label: "Customer" },
              { key: "source", label: "Source" },
              { key: "current_owner", label: "Owner" },
            ]}
          />
        );
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
