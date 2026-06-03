# ZentroFlow Web App

**AI Powered Automotive Revenue Lifecycle Platform**

## Main sidebar menu

1. **Dashboard** — KPI cards, source/stage charts, executive performance, ROI
2. **Lead Upload** — Excel import, validation, duplicate handling (C0.1)
3. **Lead Inbox** — All leads table with filters and row actions
4. **Lead Detail View** — Full customer journey with 12 tabs (most important screen)
5. **Action Engine** — Rule builder, SLA, escalation
6. **Autodialer** — C0.5 priority queue P1–P5
7. **WhatsApp Bot** — C0.4 bot journey
8. **Sales Pipeline** — C1 micro stages
9. **Finance Desk** — C1A stages
10. **Booking & Billing** — C2 stages
11. **Delivery Desk** — C3 checklist
12. **Lifecycle CRM** — Post-delivery timeline
13. **Re-engagement** — Dormant buckets and nurture
14. **Reports** — Funnel, executive, campaign analytics
15. **Masters / Settings** — Branches, products, rules, DB table reference

## UI principle

Every lead card shows: **stage · micro stage · current action · owner · next action · SLA · priority · score · escalation**.

Move Stage requires: stage, action, owner, next action, SLA.

## Run

```bash
npm install
npm run dev
```

Domain model (C0–C3 micro stages, scoring, events): `src/domain/platform.ts`  
Lead mock data: `src/domain/leads.ts`  
Navigation: `src/domain/app-nav.ts`
