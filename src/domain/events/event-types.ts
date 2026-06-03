/** Domain events — event-driven architecture backbone */

export const DOMAIN_EVENTS = [
  "lead.created",
  "contact.verified",
  "bot.engaged",
  "lead.qualified",
  "quote.shared",
  "finance.started",
  "finance.approved",
  "booking.done",
  "delivery.done",
  "service.due",
  "exchange.eligible",
  "referral.requested",
  "stage.changed",
  "score.updated",
  "sla.breached",
  "action.recommended",
  "ownership.changed",
] as const;

export type DomainEventType = (typeof DOMAIN_EVENTS)[number];

export interface DomainEvent<TPayload = Record<string, unknown>> {
  id: string;
  type: DomainEventType;
  opportunity_id: string;
  customer_id: string;
  payload: TPayload;
  occurred_at: string;
  correlation_id: string;
}

export type EventHandler<T extends DomainEventType = DomainEventType> = (
  event: DomainEvent & { type: T },
) => void | Promise<void>;

export interface EventSubscription {
  id: string;
  eventType: DomainEventType | "*";
  handler: EventHandler;
}
