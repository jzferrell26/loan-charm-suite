// Domain constants, types, and helpers (client-safe, no server imports).

export const STAGES = [
  "APPLICATION_RECEIVED",
  "LOAN_SETUP",
  "TITLE_ORDERED",
  "APPRAISAL_ORDERED",
  "SUBMITTED_TO_UW",
  "APPROVED_WITH_CONDITIONS",
  "CLEAR_TO_CLOSE",
  "DOCS_OUT",
  "DOCS_SIGNED",
  "FUNDED",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  APPLICATION_RECEIVED: "Application Received",
  LOAN_SETUP: "Loan Setup",
  TITLE_ORDERED: "Title Ordered",
  APPRAISAL_ORDERED: "Appraisal Ordered",
  SUBMITTED_TO_UW: "Submitted to Underwriting",
  APPROVED_WITH_CONDITIONS: "Approved w/ Conditions",
  CLEAR_TO_CLOSE: "Clear to Close",
  DOCS_OUT: "Docs Out",
  DOCS_SIGNED: "Docs Signed",
  FUNDED: "Funded",
};

export type StageGroup = "Prospect" | "Processing" | "Closing" | "Funded";

export const STAGE_GROUPS: Record<StageGroup, Stage[]> = {
  Prospect: ["APPLICATION_RECEIVED", "LOAN_SETUP"],
  Processing: [
    "TITLE_ORDERED",
    "APPRAISAL_ORDERED",
    "SUBMITTED_TO_UW",
    "APPROVED_WITH_CONDITIONS",
  ],
  Closing: ["CLEAR_TO_CLOSE", "DOCS_OUT", "DOCS_SIGNED"],
  Funded: ["FUNDED"],
};

export function groupOfStage(s: Stage): StageGroup {
  for (const [g, list] of Object.entries(STAGE_GROUPS) as [StageGroup, Stage[]][]) {
    if (list.includes(s)) return g;
  }
  return "Prospect";
}

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
