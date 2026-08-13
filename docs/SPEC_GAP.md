# Spec gap checklist — Consolidated Developer Spec → ZentroFlow

Maps Excel Module IDs to UI modules and implementation status (Phase 1).

| Excel ID | Module | UI / Area | Status |
|----------|--------|-----------|--------|
| 1 | Organisation Setup | Masters / Settings | Partial — CRUD via Action Engine API |
| 2 | User & Access | Auth + Masters roles | Partial — login + role list |
| 3 | Product Master | Masters | Partial — product CRUD API |
| 4 | Territory Engine | Masters branches | Partial — branch list |
| 12 | Lead Scoring | Domain engines + Lead Detail | Implemented (domain) |
| 13 | Action Engine | Action Engine module + Express API | Implemented (wired to real `zentroflow-api`) |
| 62 | SLA Escalation | sla-queue + health | Implemented (API timers/BullMQ) |
| 63 | Re-engagement | Re-engagement module | Partial — reason buckets |
| 64 | Communication | WhatsApp / Smartflo | Partial |
| 65 | Event-Driven Arch | event bus + API inbox/outbox | Implemented |
| 66 | Ownership Backbone | Golden rule + ownership history | Implemented |
| 67 | Sales Assignment | Autodialer / reassign | Partial |
| 68 | Task Engine | My Tasks in Action Engine | Implemented |
| 69 | Vehicle Stock | Booking desk | Stub |
| 70 | Discount Approval | Sales pipeline | Stub |
| 72–73 | Exec / Manager Dashboard | Main Dashboard | Partial |
| 75 | Contact Health Dashboard | Main Dashboard section | Partial |
| 78 | Customer 360 | Lead Detail tabs | Partial |
| 80–82 | Integrations | Bot / Dialer / leads API | Partial |
| 86 | Audit Trail | API audit_log | Implemented (memory) |
| Stage Master | 54 stages | `src/domain/stages/stage-master.ts` | Implemented |
| Rule Engine | 14 rules | `automation-rules.ts` + API | Implemented |

## Acceptance (sheet 07 Critical)

See [ACCEPTANCE.md](./ACCEPTANCE.md).
