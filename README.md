# ZentroFlow

**AI Powered Automotive Revenue Lifecycle Platform**

Frontend prototype for the ZentroFlow sales funnel and parallel engines. Backend to be wired later.

## Macro sales funnel (main stages only)

| Stage | Purpose |
|-------|---------|
| **C0** | Lead maturity — capture, contact health, engage, qualify, score |
| **C1** | Sales discussion, quote, objection, affordability |
| **C1A** | Finance application, approval, margin, booking intent |
| **C2** | Booking, allocation, billing, insurance, registration, PDI |
| **C3** | Retail / delivery |
| **After C3** | Lifecycle — service, referral, exchange, upgrade, repeat sale |

**Scoring runs parallel** — it is not a funnel stage.

## Parallel engines

- Lead scoring (Cold / Warm / Hot / Critical)
- Contact health & identity resolution
- Action engine (one lead = one owner + one current action + SLA)
- Automation, SLA escalation, re-engagement

## Developer model

Each micro stage: **Trigger → Action → Owner → SLA → Exit → Next stage**

Every lead record must always expose: macro stage, micro stage, current owner, current action, next action, priority, score, SLA, escalation.

Domain definitions: `src/domain/platform.ts`, `src/domain/flow-nav.ts`

Planned DB tables (reference): `customer_master`, `lead_master`, `lead_stage_history`, `lead_score`, etc. — see `platform.ts`.

## Run locally

```bash
npm install
npm run dev
```

Dev server: http://localhost:8080

## Stack

Vite, React 18, TypeScript, Tailwind, shadcn/ui
