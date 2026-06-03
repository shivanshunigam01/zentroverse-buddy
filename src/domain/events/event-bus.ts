import type { DomainEvent, DomainEventType, EventHandler, EventSubscription } from "./event-types";

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * In-process event bus — swap for Kafka/SQS/SNS in production backend.
 * Frontend uses this for engine orchestration; API layer publishes same events server-side.
 */
class EventBus {
  private subscriptions = new Map<string, EventSubscription>();
  private history: DomainEvent[] = [];
  private maxHistory = 500;

  subscribe(eventType: DomainEventType | "*", handler: EventHandler): () => void {
    const id = `sub_${Math.random().toString(36).slice(2, 9)}`;
    this.subscriptions.set(id, { id, eventType, handler });
    return () => this.subscriptions.delete(id);
  }

  async publish(event: Omit<DomainEvent, "id">): Promise<DomainEvent> {
    const full: DomainEvent = { ...event, id: generateId() };
    this.history.push(full);
    if (this.history.length > this.maxHistory) this.history.shift();

    const handlers = [...this.subscriptions.values()].filter(
      (s) => s.eventType === "*" || s.eventType === full.type,
    );

    await Promise.all(handlers.map((s) => Promise.resolve(s.handler(full as DomainEvent & { type: typeof full.type }))));
    return full;
  }

  getHistory(opportunityId?: string): DomainEvent[] {
    if (!opportunityId) return [...this.history];
    return this.history.filter((e) => e.opportunity_id === opportunityId);
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const eventBus = new EventBus();

export function createCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
