import { eventBus } from "@/domain/events/event-bus";
import { actionEngineService } from "./action-engine.service";
import * as enginesApi from "@/api/engines.api";
import { scoringService } from "./scoring.service";
import { slaService } from "./sla.service";
import type { ZentroFlowStore } from "@/store/opportunity-store";

/**
 * Wires domain events to parallel engines.
 * Backend equivalent: consumer workers subscribed to Kafka topics.
 */
export function registerEngineEventHandlers(getStore: () => ZentroFlowStore): void {
  eventBus.subscribe("lead.created", async (event) => {
    const store = getStore();
    const opp = store.getOpportunity(event.opportunity_id);
    if (!opp) return;
    const patched = slaService.evaluateSlaStatus(opp);
    store.upsertOpportunity(patched);
  });

  eventBus.subscribe("stage.changed", async (event) => {
    const store = getStore();
    const opp = store.getOpportunity(event.opportunity_id);
    if (!opp) return;
    const actionPatch = actionEngineService.applyToOpportunity(opp);
    store.upsertOpportunity({ ...opp, ...actionPatch });
  });

  eventBus.subscribe("score.updated", async (event) => {
    const store = getStore();
    const opp = store.getOpportunity(event.opportunity_id);
    if (!opp) return;
    const actionPatch = actionEngineService.applyToOpportunity(opp);
    store.upsertOpportunity({ ...opp, ...actionPatch });
  });

  eventBus.subscribe("contact.verified", async (event) => {
    const store = getStore();
    const health = store.getContactHealth(event.opportunity_id);
    const opp = store.getOpportunity(event.opportunity_id);
    if (!opp || !health) return;
    const actionPatch = actionEngineService.applyToOpportunity(opp, {}, health);
    store.upsertOpportunity({ ...opp, ...actionPatch });
  });

  eventBus.subscribe("sla.breached", async (event) => {
    const store = getStore();
    const opp = store.getOpportunity(event.opportunity_id);
    if (!opp) return;
    const actionPatch = actionEngineService.applyToOpportunity({
      ...opp,
      sla_status: "Breached",
    });
    store.upsertOpportunity({ ...opp, sla_status: "Breached", ...actionPatch });
  });

  eventBus.subscribe("bot.engaged", async (event) => {
    const store = getStore();
    const opp = store.getOpportunity(event.opportunity_id);
    if (!opp) return;
    try {
      const updated = await enginesApi.applyScore({
        opportunity_id: opp.opportunity_id,
        event: "bot.replied",
      });
      store.upsertOpportunity(updated);
    } catch {
      const { opportunity } = scoringService.applyScoreEvent(opp, "bot.replied");
      store.upsertOpportunity(opportunity);
    }
  });
}

export const eventDispatcherService = { registerEngineEventHandlers };
