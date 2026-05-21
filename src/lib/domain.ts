// Domain constants, types, and helpers (client-safe, no server imports).

export const STAGES = [
  "APPLICATION_SENT",
  "ON_HOLD",
  "APPLICATION_RECEIVED",
  "SENT_TO_PROCESSING",
  "SENT_TO_UNDERWRITING",
  "CONDITIONAL_APPROVAL",
  "FINAL_APPROVAL",
  "CLEAR_TO_CLOSE",
  "DOCS_OUT",
  "LOAN_FUNDED",
  "FUNDED_AND_PAID",
  "CANCELLED",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  APPLICATION_SENT: "Application Sent",
  ON_HOLD: "On Hold",
  APPLICATION_RECEIVED: "Application Received",
  SENT_TO_PROCESSING: "Sent to Processing",
  SENT_TO_UNDERWRITING: "Sent to Underwriting",
  CONDITIONAL_APPROVAL: "Conditional Approval",
  FINAL_APPROVAL: "Final Approval",
  CLEAR_TO_CLOSE: "Clear to Close",
  DOCS_OUT: "Docs Out",
  LOAN_FUNDED: "Loan Funded",
  FUNDED_AND_PAID: "Funded & Paid",
  CANCELLED: "Cancelled",
};

export type StageGroup =
  | "Intake"
  | "Hold"
  | "Processing"
  | "Approvals"
  | "Closing"
  | "Funded"
  | "Terminal";

export const STAGE_GROUPS: Record<StageGroup, Stage[]> = {
  Intake: ["APPLICATION_SENT", "APPLICATION_RECEIVED"],
  Hold: ["ON_HOLD"],
  Processing: ["SENT_TO_PROCESSING", "SENT_TO_UNDERWRITING"],
  Approvals: ["CONDITIONAL_APPROVAL", "FINAL_APPROVAL"],
  Closing: ["CLEAR_TO_CLOSE", "DOCS_OUT"],
  Funded: ["LOAN_FUNDED", "FUNDED_AND_PAID"],
  Terminal: ["CANCELLED"],
};

export function groupOfStage(s: Stage): StageGroup {
  for (const [g, list] of Object.entries(STAGE_GROUPS) as [StageGroup, Stage[]][]) {
    if (list.includes(s)) return g;
  }
  return "Intake";
}

// Free-text dropdown helpers (option lists pending from user).
export const LOAN_PURPOSES = ["Purchase", "Refinance", "Cash Out"] as const;
export const LOAN_TYPES = ["Hard Money", "Bridge", "Fix and Flip", "DSCR"] as const;
export const PROPERTY_TYPES = [
  "Single Family",
  "Multi Family",
  "Condo",
  "Commercial",
  "Land",
] as const;
export const PROPERTY_USAGES = ["Investment", "Primary", "Secondary"] as const;
export const CONTACT_TYPES = [
  "Real Estate Agent",
  "Escrow Agent",
  "Title Rep",
  "Attorney",
  "Appraiser",
] as const;

export type Loan = {
  id: string;
  loan_number: string | null;
  stage: Stage;
  // Standard
  loan_purpose: string | null;
  loan_type: string | null;
  loan_amount: number | null;
  interest_rate: number | null;
  ltv: number | null;
  loan_term_months: number | null;
  points: number | null;
  origination_fee: number | null;
  maturity_date: string | null;
  arv: number | null;
  purchase_price: number | null;
  down_payment: number | null;
  lender_name: string | null;
  ghl_opportunity_id: string | null;
  arive_loan_id: string | null;
  // EPICCC
  exit_strategy: string | null;
  coe_date: string | null;
  refi_payoff: number | null;
  refi_cashout: number | null;
  taxes_annual: number | null;
  insurance_annual: number | null;
  hoa_annual: number | null;
  guc_plans: string | null;
  additional_info: string | null;
  working_with_another_lender: string | null;
  if_yes_terms_offered: string | null;
  // Loan Quote
  loan_program: string | null;
  loan_term: string | null;
  initial_release_amount: number | null;
  hold_back_amount: number | null;
  ltv_ltarv: string | null;
  rate_pct: number | null;
  total_points_pct: number | null;
  investor_points_pct: number | null;
  investor_fees: number | null;
  additional_points_or_fee: string | null;
  cl_points_pct: number | null;
  cl_rebate_pct: number | null;
  cl_fees: number | null;
  cl_points_amount: number | null;
  total_points_and_fees: number | null;
  appraisal_fee: number | null;
  escrow_fees: number | null;
  title_fees: number | null;
  insurance_fee: number | null;
  inspection_fees: number | null;
  misc_fee: number | null;
  total_third_party_fees: number | null;
  monthly_payment: number | null;
  funding_source: string | null;
  term_sheet: string | null;
  referral_points_or_fees: number | null;
  created_at: string;
  updated_at: string;
};

export type Borrower = {
  id: string;
  loan_id: string;
  borrower_sequence: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  ssn: string | null;
  dob: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  marital_status: string | null;
  // EPICCC borrower
  experience_level: string | null;
  properties_owned_count: number | null;
  annual_income: number | null;
  liquid_cash: number | null;
  retirement_balance: number | null;
  credit_score: number | null;
  bk_history: string | null;
  foreclosure_history: string | null;
  // Company Info
  entity_name: string | null;
  entity_title: string | null;
  entity_address: string | null;
  entity_city: string | null;
  entity_state: string | null;
  entity_zip: string | null;
  ein: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyRow = {
  id: string;
  loan_id: string;
  address_line: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  county: string | null;
  property_type: string | null;
  property_usage: string | null;
  purchase_price: number | null;
  arv: number | null;
  appraisal_value: number | null;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  loan_id: string;
  note_text: string;
  created_by: string | null;
  created_at: string;
};

export type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  contact_type: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export function maskSsn(s: string | null | undefined): string {
  if (!s) return "";
  const digits = s.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return last4 ? `•••-••-${last4}` : "";
}

export function fullName(b: { first_name: string | null; last_name: string | null } | null | undefined): string {
  if (!b) return "";
  return [b.first_name, b.last_name].filter(Boolean).join(" ").trim();
}

export function propertyAddress(p: PropertyRow | null | undefined): string {
  if (!p) return "";
  const line1 = p.address_line ?? "";
  const tail = [p.city, p.state, p.zip].filter(Boolean).join(", ");
  return [line1, tail].filter(Boolean).join(", ");
}
