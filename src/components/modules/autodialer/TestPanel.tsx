import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { useOpportunityLeads } from "@/store/selectors";
import { ApiClientError } from "@/lib/api";
import {
  endDialerSession,
  getDialerCampaign,
  getDialerDispositions,
  getDialerHealth,
  startDialerSession,
  testLeadStatus,
  testSyncLead,
} from "@/api/dialer.api";
import type { DialerCampaign, DialerHealth, DialerTestLead } from "@/domain/dialer/types";

function friendly(err: unknown): string {
  if (err instanceof ApiClientError) return err.message;
  return "Request failed";
}

type Props = { campaign: DialerCampaign | null };

export function TestPanel({ campaign }: Props) {
  const leads = useOpportunityLeads();
  const [leadId, setLeadId] = useState(leads[0]?.opportunityId ?? "");
  const [health, setHealth] = useState<DialerHealth | null>(null);
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const options = useMemo(
    () => leads.slice(0, 40).map((l) => ({ id: l.opportunityId, label: `${l.customerName} · ${l.leadId}` })),
    [leads],
  );

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      const data = await fn();
      setResult(`${label}: SUCCESS`);
      toast.success(label);
      return data;
    } catch (err) {
      setResult(`${label}: FAILED · ${friendly(err)}`);
      toast.error(friendly(err));
      return null;
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Section title="Smartflo connection">
        <p className="text-sm">
          {campaign?.connected ? "Connected" : "Check connection"} · Campaign {campaign?.campaignIdMasked} · List{" "}
          {campaign?.leadListIdMasked}
        </p>
        {health ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Token {health.smartflo ? "set" : "missing"} · campaign {health.campaignConfigured ? "set" : "missing"} ·
            list {health.leadListConfigured ? "set" : "missing"} · dispositions{" "}
            {health.dispositionConfigured ? "set" : "missing"}
          </p>
        ) : null}
        <ActionBar>
          <Btn
            disabled={busy}
            onClick={() =>
              void run("Test Smartflo connection", async () => {
                const data = await getDialerHealth();
                setHealth(data);
                return data;
              })
            }
          >
            Test Smartflo connection
          </Btn>
          <Btn disabled={busy} onClick={() => void run("Fetch campaign", () => getDialerCampaign())}>
            Fetch campaign
          </Btn>
          <Btn disabled={busy} onClick={() => void run("Fetch dispositions", () => getDialerDispositions())}>
            Fetch dispositions
          </Btn>
          <Btn disabled={busy} onClick={() => void run("Start test session", () => startDialerSession())}>
            Start test session
          </Btn>
          <Btn variant="secondary" disabled={busy} onClick={() => void run("End test session", () => endDialerSession())}>
            End test session
          </Btn>
        </ActionBar>
      </Section>
      <Section title="Test lead">
        <label className="block text-sm">
          Select ZentroFLOW lead
          <select
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <ActionBar>
          <Btn
            disabled={busy || !leadId}
            onClick={() => void run("Sync test lead", () => testSyncLead(leadId))}
          >
            Sync to Smartflo
          </Btn>
          <Btn
            variant="secondary"
            disabled={busy || !leadId}
            onClick={() =>
              void run("Check Smartflo status", async () => {
                const data: DialerTestLead = await testLeadStatus(leadId);
                return data;
              })
            }
          >
            Check Smartflo status
          </Btn>
        </ActionBar>
        {result ? <p className="mt-3 text-sm font-medium">{result}</p> : null}
      </Section>
    </>
  );
}
