import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ModuleShell from "@/components/shared/ModuleShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { ApiClientError } from "@/lib/api";
import { getDialerCalls, getDialerCampaign, getDialerLeads, syncDialerLead, syncPendingDialerLeads } from "@/api/dialer.api";
import type { DialerCall, DialerCampaign, DialerLeadRow } from "@/domain/dialer/types";
import { AgentPanel } from "@/components/modules/autodialer/AgentPanel";
import { CampaignPanel } from "@/components/modules/autodialer/CampaignPanel";
import { LeadsPanel } from "@/components/modules/autodialer/LeadsPanel";
import { CallsPanel } from "@/components/modules/autodialer/CallsPanel";
import { TestPanel } from "@/components/modules/autodialer/TestPanel";

function friendly(err: unknown): string {
  if (err instanceof ApiClientError) return err.message;
  return "Unable to load Auto Dialer";
}

const Autodialer = () => {
  const { user } = useAuth();
  const { viewLead } = useDashboardActions();
  const isAdmin = user?.role === "admin";
  const [campaign, setCampaign] = useState<DialerCampaign | null>(null);
  const [leads, setLeads] = useState<DialerLeadRow[]>([]);
  const [calls, setCalls] = useState<DialerCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [c, l, k] = await Promise.all([
        getDialerCampaign(),
        getDialerLeads().catch(() => [] as DialerLeadRow[]),
        getDialerCalls().catch(() => [] as DialerCall[]),
      ]);
      setCampaign(c);
      setLeads(l);
      setCalls(k);
    } catch (err) {
      toast.error(friendly(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void getDialerCalls()
        .then(setCalls)
        .catch(() => undefined);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const onSync = async (id: string) => {
    setBusyId(id);
    try {
      await syncDialerLead(id);
      toast.success("Lead synced to Smartflo");
      await refresh();
    } catch (err) {
      toast.error(friendly(err));
    } finally {
      setBusyId(null);
    }
  };

  const onSyncPending = async () => {
    setLoading(true);
    try {
      const result = await syncPendingDialerLeads();
      toast.success(`Synced ${result.total} pending lead(s)`);
      await refresh();
    } catch (err) {
      toast.error(friendly(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleShell moduleId="autodialer">
      <Tabs defaultValue="agent">
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="campaign">Campaign</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          {isAdmin ? <TabsTrigger value="test">Test</TabsTrigger> : null}
        </TabsList>
        <TabsContent value="agent">
          <AgentPanel campaign={campaign} />
        </TabsContent>
        <TabsContent value="campaign">
          <CampaignPanel
            campaign={campaign}
            loading={loading}
            isAdmin={isAdmin}
            onRefresh={() => void refresh()}
            onSyncPending={() => void onSyncPending()}
            onSyncComplete={() => void refresh()}
          />
        </TabsContent>
        <TabsContent value="leads">
          <LeadsPanel
            leads={leads}
            busyId={busyId}
            onSync={(id) => void onSync(id)}
            onView={(id) => viewLead(id)}
          />
        </TabsContent>
        <TabsContent value="calls">
          <CallsPanel calls={calls} />
        </TabsContent>
        {isAdmin ? (
          <TabsContent value="test">
            <TestPanel campaign={campaign} />
          </TabsContent>
        ) : null}
      </Tabs>
    </ModuleShell>
  );
};

export default Autodialer;
