
-- Map old stages to new ones, then add CHECK constraint
UPDATE public.loans SET stage = CASE stage
  WHEN 'LOAN_SETUP' THEN 'APPLICATION_RECEIVED'
  WHEN 'TITLE_ORDERED' THEN 'SENT_TO_PROCESSING'
  WHEN 'APPRAISAL_ORDERED' THEN 'SENT_TO_PROCESSING'
  WHEN 'SUBMITTED_TO_UW' THEN 'SENT_TO_UNDERWRITING'
  WHEN 'APPROVED_WITH_CONDITIONS' THEN 'CONDITIONAL_APPROVAL'
  WHEN 'DOCS_SIGNED' THEN 'DOCS_OUT'
  WHEN 'FUNDED' THEN 'LOAN_FUNDED'
  ELSE stage
END
WHERE stage NOT IN (
  'APPLICATION_SENT','ON_HOLD','APPLICATION_RECEIVED','SENT_TO_PROCESSING',
  'SENT_TO_UNDERWRITING','CONDITIONAL_APPROVAL','FINAL_APPROVAL','CLEAR_TO_CLOSE',
  'DOCS_OUT','LOAN_FUNDED','FUNDED_AND_PAID','CANCELLED'
);

ALTER TABLE public.loans
  DROP CONSTRAINT IF EXISTS loans_stage_check,
  ADD CONSTRAINT loans_stage_check CHECK (stage IN (
    'APPLICATION_SENT','ON_HOLD','APPLICATION_RECEIVED','SENT_TO_PROCESSING',
    'SENT_TO_UNDERWRITING','CONDITIONAL_APPROVAL','FINAL_APPROVAL','CLEAR_TO_CLOSE',
    'DOCS_OUT','LOAN_FUNDED','FUNDED_AND_PAID','CANCELLED'
  ));

-- ============ LOANS: EPICCC + Loan Quote ============
ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS exit_strategy text,
  ADD COLUMN IF NOT EXISTS coe_date date,
  ADD COLUMN IF NOT EXISTS refi_payoff numeric,
  ADD COLUMN IF NOT EXISTS refi_cashout numeric,
  ADD COLUMN IF NOT EXISTS taxes_annual numeric,
  ADD COLUMN IF NOT EXISTS insurance_annual numeric,
  ADD COLUMN IF NOT EXISTS hoa_annual numeric,
  ADD COLUMN IF NOT EXISTS guc_plans text,
  ADD COLUMN IF NOT EXISTS additional_info text,
  ADD COLUMN IF NOT EXISTS working_with_another_lender text,
  ADD COLUMN IF NOT EXISTS if_yes_terms_offered text,
  -- Loan Quote
  ADD COLUMN IF NOT EXISTS loan_program text,
  ADD COLUMN IF NOT EXISTS loan_term text,
  ADD COLUMN IF NOT EXISTS initial_release_amount numeric,
  ADD COLUMN IF NOT EXISTS hold_back_amount numeric,
  ADD COLUMN IF NOT EXISTS ltv_ltarv text,
  ADD COLUMN IF NOT EXISTS rate_pct numeric,
  ADD COLUMN IF NOT EXISTS total_points_pct numeric,
  ADD COLUMN IF NOT EXISTS investor_points_pct numeric,
  ADD COLUMN IF NOT EXISTS investor_fees numeric,
  ADD COLUMN IF NOT EXISTS additional_points_or_fee text,
  ADD COLUMN IF NOT EXISTS cl_points_pct numeric,
  ADD COLUMN IF NOT EXISTS cl_rebate_pct numeric,
  ADD COLUMN IF NOT EXISTS cl_fees numeric,
  ADD COLUMN IF NOT EXISTS cl_points_amount numeric,
  ADD COLUMN IF NOT EXISTS total_points_and_fees numeric,
  ADD COLUMN IF NOT EXISTS appraisal_fee numeric,
  ADD COLUMN IF NOT EXISTS escrow_fees numeric,
  ADD COLUMN IF NOT EXISTS title_fees numeric,
  ADD COLUMN IF NOT EXISTS insurance_fee numeric,
  ADD COLUMN IF NOT EXISTS inspection_fees numeric,
  ADD COLUMN IF NOT EXISTS misc_fee numeric,
  ADD COLUMN IF NOT EXISTS total_third_party_fees numeric,
  ADD COLUMN IF NOT EXISTS monthly_payment numeric,
  ADD COLUMN IF NOT EXISTS funding_source text,
  ADD COLUMN IF NOT EXISTS term_sheet text,
  ADD COLUMN IF NOT EXISTS referral_points_or_fees numeric;

-- ============ BORROWERS: EPICCC + Company Info ============
ALTER TABLE public.borrowers
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS properties_owned_count integer,
  ADD COLUMN IF NOT EXISTS annual_income numeric,
  ADD COLUMN IF NOT EXISTS liquid_cash numeric,
  ADD COLUMN IF NOT EXISTS retirement_balance numeric,
  ADD COLUMN IF NOT EXISTS credit_score integer,
  ADD COLUMN IF NOT EXISTS bk_history text,
  ADD COLUMN IF NOT EXISTS foreclosure_history text,
  ADD COLUMN IF NOT EXISTS entity_name text,
  ADD COLUMN IF NOT EXISTS entity_title text,
  ADD COLUMN IF NOT EXISTS entity_address text,
  ADD COLUMN IF NOT EXISTS entity_city text,
  ADD COLUMN IF NOT EXISTS entity_state text,
  ADD COLUMN IF NOT EXISTS entity_zip text,
  ADD COLUMN IF NOT EXISTS ein text;
