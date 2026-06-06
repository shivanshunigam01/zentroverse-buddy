import type { StageFieldDef } from "@/domain/stages/c0-stage-fields";
import {
  FINANCE_CASH_OPTIONS,
  KNOWN_STATUS,
  YES_NO,
} from "@/domain/stages/c0-stage-fields";

const SELECT = { value: "", label: "— Select —" };

const COMPLETE: import("@/domain/stages/c0-stage-fields").StageFieldOption[] = [
  SELECT,
  { value: "done", label: "Done / complete" },
  { value: "pending", label: "Pending" },
  { value: "na", label: "Not applicable" },
];

const DECISION: import("@/domain/stages/c0-stage-fields").StageFieldOption[] = [
  SELECT,
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const OBJECTION_CATEGORIES: import("@/domain/stages/c0-stage-fields").StageFieldOption[] = [
  SELECT,
  { value: "price", label: "Price" },
  { value: "discount", label: "Discount" },
  { value: "delivery", label: "Delivery" },
  { value: "registration", label: "Registration" },
  { value: "insurance", label: "Insurance" },
  { value: "finance", label: "Finance" },
  { value: "down_payment", label: "Down payment" },
  { value: "body_fabrication", label: "Body fabrication" },
  { value: "past_issue", label: "Past issue" },
  { value: "aftersales", label: "Aftersales" },
  { value: "competition_offer", label: "Competition offer" },
  { value: "behaviour", label: "Behaviour" },
  { value: "plan_hold", label: "Plan hold" },
  { value: "tender_postponed", label: "Tender postponed" },
  { value: "other", label: "Other" },
];

const REJECTION_PATH: import("@/domain/stages/c0-stage-fields").StageFieldOption[] = [
  SELECT,
  { value: "alternate_finance", label: "Move to alternate finance queue" },
  { value: "nurture", label: "Move to nurture bucket" },
  { value: "lower_dp_emi", label: "Lower DP / EMI scheme" },
  { value: "none", label: "Not rejected / N/A" },
];

const TENURE: import("@/domain/stages/c0-stage-fields").StageFieldOption[] = [
  SELECT,
  { value: "12", label: "12 months" },
  { value: "24", label: "24 months" },
  { value: "36", label: "36 months" },
  { value: "48", label: "48 months" },
  { value: "60", label: "60 months" },
  { value: "72", label: "72 months" },
  { value: "84", label: "84 months" },
];

export const C1_STAGE_PURPOSE =
  "Quotation, explanation, objection handling, and affordability check before finance handoff.";

export const C1A_STAGE_PURPOSE =
  "Convert sales discussion into commercial readiness and booking intent.";

export const C2_STAGE_PURPOSE =
  "Complete booking and delivery preparation through billing and PDI.";

export const C3_STAGE_PURPOSE =
  "Complete sale, delivery, feedback, and activate lifecycle revenue engine.";

export const C1_STAGE_CHECKLIST: Record<string, readonly string[]> = {
  "C1.1": ["Quotation", "EMI", "Comparison", "Body fabrication estimate"],
  "C1.2": ["Customer received quote", "Customer understood quote"],
  "C1.3": ["Objection category captured", "Response logged"],
  "C1.4": ["Down payment", "EMI capacity", "Income", "Existing loan", "Family support", "Margin readiness"],
  "C1.5": ["EMI", "Interest", "Tenure", "Documents", "Guarantor", "CIBIL consent", "Lender preference"],
  "C1.6": ["Discount", "Deal terms", "Margin"],
  "C1.7": ["Manager approval", "Exception reason"],
  "C1.8": ["Manager intervention", "Resolution"],
  "C1.9": ["Decision follow-up date", "Customer commitment"],
  "C1.10": ["Finance eligibility", "Ready for C1A"],
};

export const C1A_STAGE_CHECKLIST: Record<string, readonly string[]> = {
  "C1A.1": ["Application submitted", "Application ID"],
  "C1A.2": ["PAN", "Aadhaar", "Bank", "Income docs"],
  "C1A.3": ["FI assigned", "FI visit scheduled"],
  "C1A.4": ["Verification result", "FI report"],
  "C1A.5": ["Pending / Approved / Rejected"],
  "C1A.6": ["Sanction letter", "Loan terms shared"],
  "C1A.7": ["Down payment confirmed", "Margin commitment"],
  "C1A.8": ["Product locked", "Variant locked", "Color locked"],
  "C1A.9": ["Body", "Insurance", "Accessories finalized"],
  "C1A.10": ["Booking intent", "Payment plan", "Move to C2"],
};

export const C2_STAGE_CHECKLIST: Record<string, readonly string[]> = {
  "C2.1": ["Booking amount", "Booking receipt"],
  "C2.2": ["Vehicle allocated", "Stock reference"],
  "C2.3": ["Variant lock", "Color lock"],
  "C2.4": ["Billing doc checklist", "Documents collected"],
  "C2.5": ["Disbursement status", "Lender payout"],
  "C2.6": ["Down payment collected", "Receipt issued"],
  "C2.7": ["Insurance quote", "Policy active"],
  "C2.8": ["RTO registration submitted"],
  "C2.9": ["HSRP plate status"],
  "C2.10": ["PDI checklist", "Ready for C3"],
};

export const C3_STAGE_CHECKLIST: Record<string, readonly string[]> = {
  "C3.1": ["Final payment complete"],
  "C3.2": ["Insurance active"],
  "C3.3": ["Registration complete", "RC number"],
  "C3.4": ["PDI approved"],
  "C3.5": ["Vehicle cleaned", "Fuel", "Accessories ready"],
  "C3.6": ["Delivery proof", "Handover documents"],
  "C3.7": ["CSI / feedback recorded"],
  "C3.8": ["Photo / video testimonial"],
  "C3.9": ["Referral requested"],
  "C3.10": ["Lifecycle L1–L7 activated"],
};

export const C1_STAGE_FIELDS: Record<string, StageFieldDef[]> = {
  "C1.1": [
    { key: "quote_number", label: "Quote number", type: "text" },
    { key: "quotation_sent", label: "Quotation sent", type: "select", options: YES_NO },
    { key: "emi_shared", label: "EMI shared", type: "select", options: YES_NO },
    { key: "comparison_shared", label: "Comparison shared", type: "select", options: YES_NO },
    { key: "body_fabrication_estimate", label: "Body fabrication estimate", type: "select", options: YES_NO },
    { key: "quote_amount", label: "Quote amount (₹)", type: "text", placeholder: "On-road / ex-showroom" },
    { key: "emi_amount", label: "EMI amount (₹)", type: "text" },
    { key: "quote_notes", label: "Quote details", type: "textarea", fullWidth: true },
  ],
  "C1.2": [
    { key: "quote_received", label: "Customer received quote", type: "select", options: YES_NO },
    { key: "quote_understood", label: "Customer understood quote", type: "select", options: YES_NO },
    { key: "acknowledgement_channel", label: "Acknowledgement channel", type: "select", options: [
      SELECT,
      { value: "whatsapp", label: "WhatsApp" },
      { value: "call", label: "Call" },
      { value: "visit", label: "Visit" },
      { value: "email", label: "Email" },
    ] },
    { key: "follow_up_date", label: "Follow-up date", type: "date" },
    { key: "acknowledgement_notes", label: "Acknowledgement notes", type: "textarea", fullWidth: true },
  ],
  "C1.3": [
    { key: "objection_category", label: "Primary objection category", type: "select", options: OBJECTION_CATEGORIES },
    { key: "objection_secondary", label: "Secondary objection", type: "select", options: OBJECTION_CATEGORIES },
    { key: "objection_resolved", label: "Objection resolved", type: "select", options: YES_NO },
    { key: "objection_detail", label: "Objection detail", type: "textarea", fullWidth: true },
    { key: "response_action", label: "Response / counter action", type: "textarea", fullWidth: true },
  ],
  "C1.4": [
    { key: "down_payment_capacity", label: "Down payment capacity", type: "text", placeholder: "Amount or band" },
    { key: "emi_capacity", label: "EMI capacity", type: "text", placeholder: "Max EMI per month" },
    { key: "income", label: "Income", type: "text", placeholder: "Monthly / annual" },
    { key: "existing_loan", label: "Existing loan", type: "select", options: YES_NO },
    { key: "existing_loan_detail", label: "Existing loan detail", type: "text" },
    { key: "family_support", label: "Family support", type: "select", options: YES_NO },
    { key: "margin_readiness", label: "Margin readiness", type: "select", options: KNOWN_STATUS },
    { key: "affordability_result", label: "Affordability result", type: "select", options: [
      SELECT,
      { value: "affordable", label: "Affordable" },
      { value: "stretch", label: "Stretch — needs scheme" },
      { value: "not_affordable", label: "Not affordable" },
    ] },
  ],
  "C1.5": [
    { key: "emi", label: "EMI (₹)", type: "text" },
    { key: "interest_rate", label: "Interest rate (%)", type: "text" },
    { key: "tenure", label: "Tenure", type: "select", options: TENURE },
    { key: "documents_discussed", label: "Documents discussed", type: "select", options: YES_NO },
    { key: "guarantor_required", label: "Guarantor required", type: "select", options: YES_NO },
    { key: "cibil_consent", label: "CIBIL consent", type: "select", options: YES_NO },
    { key: "lender_preference", label: "Lender preference", type: "text", placeholder: "Preferred bank / NBFC" },
    { key: "finance_notes", label: "Finance discussion notes", type: "textarea", fullWidth: true },
  ],
  "C1.6": [
    { key: "discount_requested", label: "Discount requested", type: "text" },
    { key: "discount_approved", label: "Discount approved", type: "text" },
    { key: "deal_terms", label: "Deal terms", type: "textarea", fullWidth: true },
    { key: "negotiation_status", label: "Negotiation status", type: "select", options: [
      SELECT,
      { value: "aligned", label: "Terms aligned" },
      { value: "in_progress", label: "In progress" },
      { value: "stuck", label: "Stuck" },
    ] },
  ],
  "C1.7": [
    { key: "approval_type", label: "Approval type", type: "select", options: [
      SELECT,
      { value: "discount", label: "Discount exception" },
      { value: "margin", label: "Margin exception" },
      { value: "terms", label: "Terms exception" },
      { value: "other", label: "Other" },
    ] },
    { key: "approval_status", label: "Approval status", type: "select", options: DECISION },
    { key: "approver", label: "Approver", type: "text" },
    { key: "approval_notes", label: "Approval notes", type: "textarea", fullWidth: true },
  ],
  "C1.8": [
    { key: "manager_name", label: "Manager", type: "text" },
    { key: "intervention_done", label: "Manager intervention done", type: "select", options: YES_NO },
    { key: "intervention_outcome", label: "Outcome", type: "textarea", fullWidth: true },
  ],
  "C1.9": [
    { key: "decision_follow_up_date", label: "Decision follow-up date", type: "date" },
    { key: "customer_commitment", label: "Customer commitment", type: "select", options: [
      SELECT,
      { value: "committed", label: "Committed to decide" },
      { value: "delayed", label: "Delayed" },
      { value: "unclear", label: "Unclear" },
    ] },
    { key: "decision_notes", label: "Decision pending notes", type: "textarea", fullWidth: true },
  ],
  "C1.10": [
    { key: "finance_eligible", label: "Finance eligible", type: "select", options: YES_NO },
    { key: "cash_path", label: "Cash purchase path", type: "select", options: YES_NO },
    { key: "ready_for_c1a", label: "Ready to move to C1A", type: "select", options: [
      SELECT,
      { value: "ready", label: "Ready — move to C1A" },
      { value: "not_ready", label: "Not ready yet" },
    ] },
    { key: "eligibility_notes", label: "Eligibility notes", type: "textarea", fullWidth: true },
  ],
};

export const C1A_STAGE_FIELDS: Record<string, StageFieldDef[]> = {
  "C1A.1": [
    { key: "application_id", label: "Application ID", type: "text" },
    { key: "lender", label: "Lender", type: "text" },
    { key: "application_submitted", label: "Application submitted", type: "select", options: COMPLETE },
    { key: "submission_date", label: "Submission date", type: "date" },
  ],
  "C1A.2": [
    { key: "pan_collected", label: "PAN collected", type: "select", options: YES_NO },
    { key: "aadhaar_collected", label: "Aadhaar collected", type: "select", options: YES_NO },
    { key: "bank_docs_collected", label: "Bank statements collected", type: "select", options: YES_NO },
    { key: "income_docs_collected", label: "Income docs collected", type: "select", options: YES_NO },
    { key: "docs_complete", label: "All documents complete", type: "select", options: YES_NO },
    { key: "docs_notes", label: "Document notes", type: "textarea", fullWidth: true },
  ],
  "C1A.3": [
    { key: "fi_assigned", label: "FI assigned", type: "select", options: YES_NO },
    { key: "fi_agent", label: "FI agent name", type: "text" },
    { key: "fi_visit_date", label: "FI visit date", type: "date" },
  ],
  "C1A.4": [
    { key: "verification_result", label: "Verification result", type: "select", options: [
      SELECT,
      { value: "positive", label: "Positive" },
      { value: "negative", label: "Negative" },
      { value: "pending", label: "Pending" },
    ] },
    { key: "verification_notes", label: "Verification notes", type: "textarea", fullWidth: true },
  ],
  "C1A.5": [
    { key: "decision_status", label: "Decision status", type: "select", options: DECISION },
    { key: "decision_date", label: "Decision date", type: "date" },
    { key: "rejection_path", label: "If rejected — next path", type: "select", options: REJECTION_PATH },
    { key: "decision_notes", label: "Decision notes", type: "textarea", fullWidth: true },
  ],
  "C1A.6": [
    { key: "sanction_letter_shared", label: "Sanction letter shared", type: "select", options: YES_NO },
    { key: "sanction_amount", label: "Sanction amount (₹)", type: "text" },
    { key: "loan_tenure", label: "Loan tenure", type: "select", options: TENURE },
    { key: "approval_notes", label: "Approval notes", type: "textarea", fullWidth: true },
  ],
  "C1A.7": [
    { key: "down_payment_confirmed", label: "Down payment confirmed", type: "select", options: YES_NO },
    { key: "down_payment_amount", label: "Down payment amount (₹)", type: "text" },
    { key: "margin_confirmed", label: "Margin confirmed", type: "select", options: YES_NO },
  ],
  "C1A.8": [
    { key: "product_locked", label: "Product locked", type: "select", options: YES_NO },
    { key: "variant_locked", label: "Variant locked", type: "text" },
    { key: "color_locked", label: "Color locked", type: "text" },
  ],
  "C1A.9": [
    { key: "body_finalized", label: "Body finalized", type: "select", options: YES_NO },
    { key: "insurance_finalized", label: "Insurance finalized", type: "select", options: YES_NO },
    { key: "accessories_finalized", label: "Accessories finalized", type: "select", options: YES_NO },
    { key: "final_deal_value", label: "Final deal value (₹)", type: "text" },
    { key: "addons_notes", label: "Add-ons detail", type: "textarea", fullWidth: true },
  ],
  "C1A.10": [
    { key: "booking_intent_confirmed", label: "Booking intent confirmed", type: "select", options: YES_NO },
    { key: "payment_plan", label: "Payment plan", type: "select", options: FINANCE_CASH_OPTIONS },
    { key: "rejection_path", label: "If finance rejected — path", type: "select", options: REJECTION_PATH },
    { key: "ready_for_c2", label: "Ready to move to C2", type: "select", options: [
      SELECT,
      { value: "ready", label: "Ready — move to C2" },
      { value: "not_ready", label: "Not ready yet" },
    ] },
  ],
};

export const C2_STAGE_FIELDS: Record<string, StageFieldDef[]> = {
  "C2.1": [
    { key: "booking_amount", label: "Booking amount (₹)", type: "text" },
    { key: "booking_receipt", label: "Booking receipt issued", type: "select", options: YES_NO },
    { key: "booking_date", label: "Booking date", type: "date" },
    { key: "booking_reference", label: "Booking reference", type: "text" },
  ],
  "C2.2": [
    { key: "vehicle_allocated", label: "Vehicle allocated", type: "select", options: YES_NO },
    { key: "stock_reference", label: "Stock / chassis reference", type: "text" },
    { key: "allocation_date", label: "Allocation date", type: "date" },
  ],
  "C2.3": [
    { key: "variant_locked", label: "Variant locked", type: "select", options: YES_NO },
    { key: "color_locked", label: "Color locked", type: "text" },
    { key: "lock_approved_by", label: "Lock approved by", type: "text" },
  ],
  "C2.4": [
    { key: "billing_checklist_sent", label: "Billing checklist sent", type: "select", options: YES_NO },
    { key: "billing_docs_complete", label: "Billing documents complete", type: "select", options: YES_NO },
    { key: "billing_notes", label: "Billing document notes", type: "textarea", fullWidth: true },
  ],
  "C2.5": [
    { key: "disbursement_status", label: "Disbursement status", type: "select", options: [
      SELECT,
      { value: "pending", label: "Pending" },
      { value: "partial", label: "Partial" },
      { value: "received", label: "Received" },
    ] },
    { key: "disbursement_amount", label: "Disbursement amount (₹)", type: "text" },
    { key: "disbursement_date", label: "Disbursement date", type: "date" },
  ],
  "C2.6": [
    { key: "down_payment_received", label: "Down payment received", type: "select", options: YES_NO },
    { key: "down_payment_amount", label: "Amount (₹)", type: "text" },
    { key: "receipt_number", label: "Receipt number", type: "text" },
  ],
  "C2.7": [
    { key: "insurance_quote", label: "Insurance quote generated", type: "select", options: YES_NO },
    { key: "policy_number", label: "Policy number", type: "text" },
    { key: "insurance_active", label: "Insurance active", type: "select", options: YES_NO },
  ],
  "C2.8": [
    { key: "registration_submitted", label: "Registration submitted", type: "select", options: YES_NO },
    { key: "rto_office", label: "RTO office", type: "text" },
    { key: "registration_status", label: "Status", type: "select", options: [
      SELECT,
      { value: "submitted", label: "Submitted" },
      { value: "in_process", label: "In process" },
      { value: "complete", label: "Complete" },
    ] },
  ],
  "C2.9": [
    { key: "hsrp_status", label: "HSRP status", type: "select", options: [
      SELECT,
      { value: "pending", label: "Pending" },
      { value: "ordered", label: "Ordered" },
      { value: "ready", label: "Ready" },
    ] },
    { key: "hsrp_number", label: "Plate number", type: "text" },
  ],
  "C2.10": [
    { key: "pdi_complete", label: "PDI complete", type: "select", options: YES_NO },
    { key: "pdi_inspector", label: "PDI inspector", type: "text" },
    { key: "pdi_date", label: "PDI date", type: "date" },
    { key: "pdi_notes", label: "PDI checklist notes", type: "textarea", fullWidth: true },
    { key: "ready_for_c3", label: "Ready for C3", type: "select", options: YES_NO },
  ],
};

export const C3_STAGE_FIELDS: Record<string, StageFieldDef[]> = {
  "C3.1": [
    { key: "final_payment_complete", label: "Final payment complete", type: "select", options: YES_NO },
    { key: "final_payment_amount", label: "Final payment amount (₹)", type: "text" },
    { key: "payment_date", label: "Payment date", type: "date" },
  ],
  "C3.2": [
    { key: "insurance_active", label: "Insurance active", type: "select", options: YES_NO },
    { key: "policy_number", label: "Policy number", type: "text" },
    { key: "policy_expiry", label: "Policy expiry", type: "date" },
  ],
  "C3.3": [
    { key: "registration_complete", label: "Registration complete", type: "select", options: YES_NO },
    { key: "rc_number", label: "RC / registration number", type: "text" },
  ],
  "C3.4": [
    { key: "pdi_approved", label: "PDI approved", type: "select", options: YES_NO },
    { key: "pdi_notes", label: "PDI notes", type: "textarea", fullWidth: true },
  ],
  "C3.5": [
    { key: "vehicle_ready", label: "Vehicle ready for handover", type: "select", options: YES_NO },
    { key: "fuel_level", label: "Fuel level", type: "text" },
    { key: "accessories_fitted", label: "Accessories fitted", type: "select", options: YES_NO },
  ],
  "C3.6": [
    { key: "delivery_done", label: "Delivery done", type: "select", options: YES_NO },
    { key: "delivery_date", label: "Delivery date", type: "date" },
    { key: "handover_documents", label: "Handover documents collected", type: "select", options: YES_NO },
    { key: "delivery_proof", label: "Delivery proof reference", type: "text" },
  ],
  "C3.7": [
    { key: "feedback_taken", label: "Feedback taken", type: "select", options: YES_NO },
    { key: "csi_score", label: "CSI score", type: "text" },
    { key: "feedback_notes", label: "Feedback notes", type: "textarea", fullWidth: true },
  ],
  "C3.8": [
    { key: "testimonial_captured", label: "Photo / video testimonial captured", type: "select", options: YES_NO },
    { key: "testimonial_type", label: "Type", type: "select", options: [
      SELECT,
      { value: "photo", label: "Photo" },
      { value: "video", label: "Video" },
      { value: "both", label: "Both" },
    ] },
    { key: "testimonial_link", label: "Media link / reference", type: "text" },
  ],
  "C3.9": [
    { key: "referral_asked", label: "Referral asked", type: "select", options: YES_NO },
    { key: "referral_name", label: "Referral name / contact", type: "text" },
    { key: "referral_notes", label: "Referral notes", type: "textarea", fullWidth: true },
  ],
  "C3.10": [
    { key: "lifecycle_activated", label: "Lifecycle activated", type: "select", options: YES_NO },
    { key: "lifecycle_programs", label: "Programs activated", type: "text", placeholder: "L1 Service, L2 Insurance, …" },
    { key: "ready_for_l1", label: "Ready for L1 Service", type: "select", options: YES_NO },
  ],
};

export function isPipelineStage(code: string): boolean {
  return (
    code.startsWith("C1.") ||
    code.startsWith("C1A.") ||
    code.startsWith("C2.") ||
    code.startsWith("C3.")
  );
}

export function getPipelineStageFields(code: string): StageFieldDef[] {
  return (
    C1_STAGE_FIELDS[code] ??
    C1A_STAGE_FIELDS[code] ??
    C2_STAGE_FIELDS[code] ??
    C3_STAGE_FIELDS[code] ??
    []
  );
}

export function getPipelineStageChecklist(code: string): readonly string[] | undefined {
  return (
    C1_STAGE_CHECKLIST[code] ??
    C1A_STAGE_CHECKLIST[code] ??
    C2_STAGE_CHECKLIST[code] ??
    C3_STAGE_CHECKLIST[code]
  );
}
