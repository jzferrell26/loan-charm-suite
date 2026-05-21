import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { STAGES } from "./domain";

const WEBHOOK_URL = "https://n8n.voyze.ai/webhook/processing-portal-stage-change";

const NullableNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().nullable(),
);
const NullableString = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : String(v)),
  z.string().nullable(),
);

const BorrowerInput = z.object({
  id: z.string().uuid().nullable().optional(),
  borrower_sequence: z.number().int().min(1).max(4),
  first_name: NullableString.optional(),
  last_name: NullableString.optional(),
  email: NullableString.optional(),
  phone: NullableString.optional(),
  ssn: NullableString.optional(),
  dob: NullableString.optional(),
  address_line: NullableString.optional(),
  city: NullableString.optional(),
  state: NullableString.optional(),
  zip: NullableString.optional(),
  marital_status: NullableString.optional(),
  // EPICCC
  experience_level: NullableString.optional(),
  properties_owned_count: NullableNumber.optional(),
  annual_income: NullableNumber.optional(),
  liquid_cash: NullableNumber.optional(),
  retirement_balance: NullableNumber.optional(),
  credit_score: NullableNumber.optional(),
  bk_history: NullableString.optional(),
  foreclosure_history: NullableString.optional(),
  // Company Info
  entity_name: NullableString.optional(),
  entity_title: NullableString.optional(),
  entity_address: NullableString.optional(),
  entity_city: NullableString.optional(),
  entity_state: NullableString.optional(),
  entity_zip: NullableString.optional(),
  ein: NullableString.optional(),
});

const PropertyInput = z.object({
  address_line: NullableString.optional(),
  city: NullableString.optional(),
  state: NullableString.optional(),
  zip: NullableString.optional(),
  county: NullableString.optional(),
  property_type: NullableString.optional(),
  property_usage: NullableString.optional(),
  purchase_price: NullableNumber.optional(),
  arv: NullableNumber.optional(),
  appraisal_value: NullableNumber.optional(),
});

const LoanInput = z.object({
  stage: z.enum(STAGES).optional(),
  loan_purpose: NullableString.optional(),
  loan_type: NullableString.optional(),
  loan_amount: NullableNumber.optional(),
  interest_rate: NullableNumber.optional(),
  ltv: NullableNumber.optional(),
  loan_term_months: NullableNumber.optional(),
  points: NullableNumber.optional(),
  origination_fee: NullableNumber.optional(),
  maturity_date: NullableString.optional(),
  arv: NullableNumber.optional(),
  purchase_price: NullableNumber.optional(),
  down_payment: NullableNumber.optional(),
  lender_name: NullableString.optional(),
  ghl_opportunity_id: NullableString.optional(),
  arive_loan_id: NullableString.optional(),
  // EPICCC loan
  exit_strategy: NullableString.optional(),
  coe_date: NullableString.optional(),
  refi_payoff: NullableNumber.optional(),
  refi_cashout: NullableNumber.optional(),
  taxes_annual: NullableNumber.optional(),
  insurance_annual: NullableNumber.optional(),
  hoa_annual: NullableNumber.optional(),
  guc_plans: NullableString.optional(),
  additional_info: NullableString.optional(),
  working_with_another_lender: NullableString.optional(),
  if_yes_terms_offered: NullableString.optional(),
  // Loan Quote
  loan_program: NullableString.optional(),
  loan_term: NullableString.optional(),
  initial_release_amount: NullableNumber.optional(),
  hold_back_amount: NullableNumber.optional(),
  ltv_ltarv: NullableString.optional(),
  rate_pct: NullableNumber.optional(),
  total_points_pct: NullableNumber.optional(),
  investor_points_pct: NullableNumber.optional(),
  investor_fees: NullableNumber.optional(),
  additional_points_or_fee: NullableString.optional(),
  cl_points_pct: NullableNumber.optional(),
  cl_rebate_pct: NullableNumber.optional(),
  cl_fees: NullableNumber.optional(),
  cl_points_amount: NullableNumber.optional(),
  total_points_and_fees: NullableNumber.optional(),
  appraisal_fee: NullableNumber.optional(),
  escrow_fees: NullableNumber.optional(),
  title_fees: NullableNumber.optional(),
  insurance_fee: NullableNumber.optional(),
  inspection_fees: NullableNumber.optional(),
  misc_fee: NullableNumber.optional(),
  total_third_party_fees: NullableNumber.optional(),
  monthly_payment: NullableNumber.optional(),
  funding_source: NullableString.optional(),
  term_sheet: NullableString.optional(),
  referral_points_or_fees: NullableNumber.optional(),
});


// ---------------- LIST ----------------
export const listLoans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("loans")
      .select("*, borrowers(*), properties(*)")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------------- GET ----------------
export const getLoan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: loan, error } = await supabase
      .from("loans")
      .select("*, borrowers(*), properties(*), notes(*), stage_history(*)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return loan;
  });

// ---------------- CREATE ----------------
export const createLoan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        loan: LoanInput,
        borrowers: z.array(BorrowerInput).min(1).max(4),
        property: PropertyInput,
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: loan, error: lErr } = await supabase
      .from("loans")
      .insert({ ...data.loan, stage: data.loan.stage ?? "APPLICATION_RECEIVED" })
      .select("*")
      .single();
    if (lErr || !loan) throw new Error(lErr?.message ?? "Failed to create loan");

    const borrowersPayload = data.borrowers.map((b) => {
      const { id: _omit, ...rest } = b as { id?: string } & Record<string, unknown>;
      void _omit;
      return { ...rest, loan_id: loan.id };
    });
    const { error: bErr } = await supabase.from("borrowers").insert(borrowersPayload);
    if (bErr) throw new Error(bErr.message);

    const { error: pErr } = await supabase
      .from("properties")
      .insert({ ...data.property, loan_id: loan.id });
    if (pErr) throw new Error(pErr.message);

    return { id: loan.id };
  });

// ---------------- UPDATE (loan fields only, not stage) ----------------
export const updateLoan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), patch: LoanInput }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { stage, ...rest } = data.patch;
    void stage; // stage uses separate endpoint
    const { error } = await supabase.from("loans").update(rest).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- UPDATE STAGE + WEBHOOK ----------------
export const updateLoanStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), new_stage: z.enum(STAGES) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: before, error: bErr } = await supabase
      .from("loans")
      .select("id, loan_number, stage, loan_amount, ghl_opportunity_id, borrowers(first_name, last_name, borrower_sequence), properties(address_line, city, state, zip)")
      .eq("id", data.id)
      .single();
    if (bErr || !before) throw new Error(bErr?.message ?? "Loan not found");

    if (before.stage === data.new_stage) return { ok: true, unchanged: true };

    const { error: uErr } = await supabase
      .from("loans")
      .update({ stage: data.new_stage })
      .eq("id", data.id);
    if (uErr) throw new Error(uErr.message);

    const primary = (before.borrowers ?? []).sort(
      (a: { borrower_sequence: number }, b: { borrower_sequence: number }) =>
        a.borrower_sequence - b.borrower_sequence,
    )[0];
    const prop = (before.properties ?? [])[0];
    const payload = {
      loan_id: before.id,
      loan_number: before.loan_number ?? "",
      borrower_name: primary
        ? [primary.first_name, primary.last_name].filter(Boolean).join(" ")
        : "",
      property_address: prop
        ? [prop.address_line, prop.city, prop.state, prop.zip].filter(Boolean).join(", ")
        : "",
      loan_amount: before.loan_amount ?? "",
      old_stage: before.stage,
      new_stage: data.new_stage,
      ghl_opportunity_id: before.ghl_opportunity_id ?? "",
      timestamp: new Date().toISOString(),
    };

    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    }).catch((err) => {
      console.error("[stage webhook] failed:", err);
    });

    return { ok: true };
  });

// ---------------- BORROWERS ----------------
export const upsertBorrower = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ loan_id: z.string().uuid(), borrower: BorrowerInput }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { borrower } = data;
    if (borrower.id) {
      const { error } = await supabase
        .from("borrowers")
        .update({ ...borrower, id: undefined })
        .eq("id", borrower.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("borrowers")
        .insert({ ...borrower, id: undefined, loan_id: data.loan_id });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteBorrower = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("borrowers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- PROPERTIES ----------------
export const upsertProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ loan_id: z.string().uuid(), property: PropertyInput }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("loan_id", data.loan_id)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase
        .from("properties")
        .update(data.property)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("properties")
        .insert({ ...data.property, loan_id: data.loan_id });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------------- NOTES ----------------
export const addNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ loan_id: z.string().uuid(), note_text: z.string().min(1).max(5000) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, claims } = context;
    const author = (claims?.email as string) ?? "User";
    const { error } = await supabase.from("notes").insert({
      loan_id: data.loan_id,
      note_text: data.note_text,
      created_by: author,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
