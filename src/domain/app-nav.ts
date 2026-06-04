/** ZentroFlow main sidebar menu */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Upload,
  Inbox,
  FileSearch,
  Zap,
  Phone,
  MessageCircle,
  TrendingUp,
  Landmark,
  ClipboardCheck,
  Truck,
  RefreshCw,
  RotateCcw,
  BarChart3,
  Settings,
} from "lucide-react";

export type AppModuleId =
  | "dashboard"
  | "lead-upload"
  | "lead-inbox"
  | "lead-detail"
  | "action-engine"
  | "autodialer"
  | "whatsapp-bot"
  | "sales-pipeline"
  | "finance-desk"
  | "booking-billing"
  | "delivery-desk"
  | "lifecycle-crm"
  | "re-engagement"
  | "reports"
  | "masters";

export type NavItem = {
  id: AppModuleId;
  label: string;
  badge?: number | string;
};

export const MAIN_SIDEBAR: NavItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "lead-upload", label: "Lead Upload" },
  { id: "lead-inbox", label: "Lead Inbox" },
  { id: "lead-detail", label: "Lead Detail View" },
  { id: "action-engine", label: "Action Engine" },
  { id: "autodialer", label: "Autodialer" },
  { id: "whatsapp-bot", label: "WhatsApp Bot" },
  { id: "sales-pipeline", label: "Sales Pipeline" },
  { id: "finance-desk", label: "Finance Desk" },
  { id: "booking-billing", label: "Booking & Billing" },
  { id: "delivery-desk", label: "Delivery Desk" },
  { id: "lifecycle-crm", label: "Lifecycle CRM" },
  { id: "re-engagement", label: "Re-engagement" },
  { id: "reports", label: "Reports" },
  { id: "masters", label: "Masters / Settings" },
];

export const MODULE_ICONS: Record<AppModuleId, LucideIcon> = {
  dashboard: LayoutDashboard,
  "lead-upload": Upload,
  "lead-inbox": Inbox,
  "lead-detail": FileSearch,
  "action-engine": Zap,
  autodialer: Phone,
  "whatsapp-bot": MessageCircle,
  "sales-pipeline": TrendingUp,
  "finance-desk": Landmark,
  "booking-billing": ClipboardCheck,
  "delivery-desk": Truck,
  "lifecycle-crm": RefreshCw,
  "re-engagement": RotateCcw,
  reports: BarChart3,
  masters: Settings,
};

export const MODULE_TITLES: Record<AppModuleId, { title: string; subtitle: string }> = {
  dashboard: { title: "Main Dashboard", subtitle: "Leads, funnel, performance, and SLA at a glance" },
  "lead-upload": { title: "Upload Leads", subtitle: "Excel import, validation, duplicate handling" },
  "lead-inbox": { title: "All Leads", subtitle: "Where it is · who owns it · what happens next" },
  "lead-detail": { title: "Lead Detail", subtitle: "Full customer journey — overview to lifecycle" },
  "action-engine": { title: "Action Engine", subtitle: "Rules, SLA, escalation, next best action" },
  autodialer: { title: "Autodialer", subtitle: "C0.5 priority queue P1–P5" },
  "whatsapp-bot": { title: "WhatsApp Bot", subtitle: "C0.4 bot engagement journey" },
  "sales-pipeline": { title: "Sales Pipeline", subtitle: "C1 — quote, objection, affordability, demo" },
  "finance-desk": { title: "Finance Desk", subtitle: "C1A — Finance Approval & Intent (10 phases)" },
  "booking-billing": { title: "Booking & Billing", subtitle: "C2 — Booking to Billing (10 phases)" },
  "delivery-desk": { title: "Delivery Desk", subtitle: "C3 — Retail / Delivery (10 phases)" },
  "lifecycle-crm": { title: "Lifecycle CRM", subtitle: "Post-delivery 10-year revenue timeline" },
  "re-engagement": { title: "Re-engagement", subtitle: "Dormant, nurture, recycle buckets" },
  reports: { title: "Reports", subtitle: "Source, stage, executive, campaign ROI" },
  masters: { title: "Masters / Settings", subtitle: "Branches, executives, products, rules" },
};
