## Plan: Full pipeline + custom field model

Builds out the database, types, and loan detail UI to mirror the GHL Opportunity model: pipeline stages, EPICCC, Loan Quote, and Company Info (per-borrower entity).

### 1. Database migration

**Stage enum + history**
- Add `app_stage` text constraint with the 12 stages: `APPLICATION_SENT`, `ON_HOLD`, `APPLICATION_RECEIVED`, `SENT_TO_PROCESSING`, `SENT_TO_UNDERWRITING`, `CONDITIONAL_APPROVAL`, `FINAL_APPROVAL`, `CLEAR_TO_CLOSE`, `DOCS_OUT`, `LOAN_FUNDED`, `FUNDED_AND_PAID`, `CANCELLED`.
- Existing `loans.stage` already text — add CHECK constraint.

**Extend `loans` (EPICCC loan-level + Loan Quote)**
EPICCC loan fields: `loan_purpose`, `exit_strategy`, `coe_date`, `arv`, `refi_payoff`, `refi_cashout`, `taxes_annual`, `insurance_annual`, `hoa_annual`, `guc_plans` (text), `additional_info` (multi-line), `working_with_another_lender`, `if_yes_terms_offered`.

Loan Quote fields: `loan_type` (multi), `loan_program`, `loan_term`, `initial_release_amount`, `hold_back_amount`, `loan_amount` (already exists), `ltv_ltarv` (text), `rate_pct`, `total_points_pct`, `investor_points_pct`, `investor_fees`, `additional_points_or_fee`, `cl_points_pct`, `cl_rebate_pct`, `cl_fees`, `cl_points_amount`, `total_points_and_fees`, `appraisal_fee`, `escrow_fees`, `title_fees`, `insurance_fee`, `inspection_fees`, `misc_fee`, `total_third_party_fees`, `monthly_payment`, `funding_source`, `term_sheet` (dropdown), `referral_points_or_fees`.

**Extend `borrowers` (per-borrower EPICCC + Company Info)**
EPICCC borrower fields: `experience_level`, `properties_owned_count`, `annual_income`, `liquid_cash`, `retirement_balance`, `credit_score`, `bk_history`, `foreclosure_history`, plus the rest from your borrower list.

Company Info fields: `entity_name`, `entity_title` (Member/Manager/etc), `entity_address`, `entity_city`, `entity_state`, `entity_zip`, `ein`.

**Dropdown values** stored as plain text (free entry until you send option lists).

### 2. Stage badge colors (grouped)
- Intake (blue): Application Sent, Application Received
- Hold (gray): On Hold
- Processing/Underwriting (amber): Sent To Processing, Sent To Underwriting
- Approvals (violet): Conditional Approval, Final Approval
- Closing (emerald): Clear To Close, Docs Out
- Funded (green): Loan Funded, Funded & Paid
- Terminal (red): Cancelled

### 3. UI updates

**Pipeline / Kanban + list**
- Update stage enum + labels in `src/lib/loan-stages.ts` (or equivalent).
- Update stage `<Select>` in loan detail.
- Update stage badge color map.

**Loan detail page — tabbed sections**
- Overview (existing standard fields)
- **Loan Quote** — all 28 fee/rate fields, grouped (Loan Terms / Points & Rate / Third-Party Fees / Funding)
- **EPICCC — Loan** — purpose, exit strategy, COE, ARV, refi, taxes/ins/HOA, GUC plans, additional info
- **Borrowers** — list of normalized borrowers with expandable card per borrower:
  - Personal (existing)
  - EPICCC (experience, income, cash, credit, BK/FC, etc.)
  - Company Info (entity name, title, address, EIN)
  - "Add borrower" up to 4
- **Notes** + **Stage history** (existing)

All fields editable inline with debounced save to Supabase via `createServerFn`.

### 4. Files touched
- New migration (schema only)
- `src/lib/loan-stages.ts` — stages, labels, colors
- `src/lib/loans.functions.ts` — extend update/get
- `src/lib/borrowers.functions.ts` — new (CRUD for borrowers)
- `src/routes/_authenticated/loans.$loanId.tsx` — tabs + new sections
- New components: `LoanQuoteSection`, `EpiccLoanSection`, `BorrowerCard`, `CompanyInfoSection`

### What's NOT in this plan (waiting on you)
- Remaining folders (Tasks, Loan Notes, Documents, etc.) — handled in a follow-up
- Dropdown option lists (Loan Purpose, Exit Strategy, Loan Program, Loan Term, Term Sheet, Property Type, etc.) — fields will accept free text until you send them, then I'll swap to `<Select>`s.

Approve and I'll run the migration and build the UI.
