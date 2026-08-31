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
  Users,
  Contact,
  CalendarClock,
  PieChart,
  SlidersHorizontal,
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
  | "masters"
  | "crm-dashboard"
  | "crm-leads"
  | "crm-lead-detail"
  | "crm-customers"
  | "crm-followups"
  | "crm-settings"
  | "crm-test-drives"
  | "crm-quotations"
  | "crm-bookings"
  | "crm-retail"
  | "crm-lost-leads";

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

export const CRM_SIDEBAR: NavItem[] = [
  { id: "crm-dashboard", label: "CRM Dashboard" },
  { id: "crm-leads", label: "CRM Leads" },
  { id: "crm-lead-detail", label: "Lead 360" },
  { id: "crm-customers", label: "Customers" },
  { id: "crm-followups", label: "Follow-ups" },
  { id: "crm-test-drives", label: "Test Drives" },
  { id: "crm-quotations", label: "Quotations" },
  { id: "crm-bookings", label: "Bookings" },
  { id: "crm-retail", label: "Retail" },
  { id: "crm-lost-leads", label: "Lost Leads" },
  { id: "crm-settings", label: "CRM Settings" },
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
  "crm-dashboard": PieChart,
  "crm-leads": Inbox,
  "crm-lead-detail": Contact,
  "crm-customers": Users,
  "crm-followups": CalendarClock,
  "crm-settings": SlidersHorizontal,
  "crm-test-drives": Truck,
  "crm-quotations": ClipboardCheck,
  "crm-bookings": Landmark,
  "crm-retail": TrendingUp,
  "crm-lost-leads": RotateCcw,
};

export const MODULE_TITLES: Record<AppModuleId, { title: string; subtitle: string }> = {
  dashboard: { title: "Main Dashboard", subtitle: "Leads, funnel, performance, and SLA at a glance" },
  "lead-upload": { title: "Upload Leads", subtitle: "Excel import, validation, duplicate handling" },
  "lead-inbox": { title: "All Leads", subtitle: "Where it is · who owns it · what happens next" },
  "lead-detail": { title: "Lead Detail", subtitle: "Full customer journey — overview to lifecycle" },
  "action-engine": { title: "Action Engine", subtitle: "Rules, SLA, escalation, next best action" },
  autodialer: { title: "Autodialer", subtitle: "Smartflo Auto Dialer — campaign, leads, calls, C0.5 queue" },
  "whatsapp-bot": { title: "WhatsApp Bot", subtitle: "C0.4 bot engagement journey" },
  "sales-pipeline": { title: "Sales Pipeline", subtitle: "C1 — quote, objection, affordability, demo" },
  "finance-desk": { title: "Finance Desk", subtitle: "C1A — Finance Approval & Intent (10 phases)" },
  "booking-billing": { title: "Booking & Billing", subtitle: "C2 — Booking to Billing (10 phases)" },
  "delivery-desk": { title: "Delivery Desk", subtitle: "C3 — Retail / Delivery (10 phases)" },
  "lifecycle-crm": { title: "Lifecycle CRM", subtitle: "Post-delivery 10-year revenue timeline" },
  "re-engagement": { title: "Re-engagement", subtitle: "Dormant, nurture, recycle buckets" },
  reports: { title: "Reports", subtitle: "Source, stage, executive, campaign ROI" },
  masters: { title: "Masters / Settings", subtitle: "Branches, executives, products, rules" },
  "crm-dashboard": { title: "CRM Dashboard", subtitle: "Tenant-scoped lead metrics and pipeline health" },
  "crm-leads": { title: "CRM Leads", subtitle: "Server-paginated lead management" },
  "crm-lead-detail": { title: "Lead 360", subtitle: "Customer, stage, timeline, and communications" },
  "crm-customers": { title: "CRM Customers", subtitle: "Customer identity and enquiry history" },
  "crm-followups": { title: "CRM Follow-ups", subtitle: "Today, overdue, and upcoming follow-up queue" },
  "crm-settings": { title: "CRM Settings", subtitle: "Score rules, stages, routing, and integrations" },
  "crm-test-drives": { title: "Test Drives", subtitle: "Scheduled test drives across leads" },
  "crm-quotations": { title: "Quotations", subtitle: "Quotes and pricing for leads" },
  "crm-bookings": { title: "Bookings", subtitle: "Confirmed bookings" },
  "crm-retail": { title: "Retail", subtitle: "Retail and delivery records" },
  "crm-lost-leads": { title: "Lost Leads", subtitle: "Leads marked as lost" },
};
