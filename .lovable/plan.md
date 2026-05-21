# Processing Portal — Supabase Migration & Full Build

Move from the current mock-data/Zustand setup to a fully Supabase-backed app matching the Arive visual reference, with auth, persistent data across all 6 screens, stage-history logging, and the n8n webhook on stage change.

## 1. Backend: Enable Lovable Cloud + schema

Enable Lovable Cloud, then create migrations for:

- `loans` — all spec fields, `loan_number` auto-generated via sequence + trigger (e.g. `L-2026-0001`), `updated_at` auto-touched by trigger.
- `borrowers` — FK to `loans`, `borrower_sequence` 1–4, unique `(loan_id, borrower_sequence)`.
- `properties` — FK to `loans`.
- `notes` — FK to `loans`, ordered by `created_at desc`.
- `contacts` — standalone.
- `stage_history` — FK to `loans`, captures old/new stage, `changed_by`, `changed_at`.

Plus:
- Enum-style CHECK constraints on `stage`, `loan_purpose`, `loan_type`, `property_type`, `property_usage`, `contact_type`.
- Trigger: on `loans.stage` update, insert a row into `stage_history`.
- RLS enabled on every table. Since this is an internal 3-user tool with no self-signup, policies are "any authenticated user can select/insert/update/delete". No public/anon access.
- `created_by` / `changed_by` default to `auth.uid()`.

## 2. Auth

- Supabase email+password auth, no self-signup (users added via dashboard).
- `/login` route (public): email + password form.
- `_authenticated` pathless layout route gates everything else via `beforeLoad` + `redirect`.
- Session persisted by the browser Supabase client (already default).
- `onAuthStateChange` wired once in `__root.tsx` to invalidate router + query cache.
- Logout from the avatar menu in `TopNav`.

## 3. Data layer

- Use TanStack Query (already in template) with `createServerFn` + `requireSupabaseAuth` for all reads/writes.
- Server fns live in `src/lib/*.functions.ts`:
  - `loans.functions.ts` — list, get by id, create, update, updateStage (also fires webhook server-side).
  - `borrowers.functions.ts` — list, get, create/update/delete (scoped to loan).
  - `properties.functions.ts` — upsert per loan.
  - `notes.functions.ts` — list by loan, add.
  - `contacts.functions.ts` — list, create, update.
  - `dashboard.functions.ts` — aggregated stats + pipeline breakdown.
- All mutations call `queryClient.invalidateQueries` for affected keys.
- Delete `src/lib/mock-data.ts` and `src/lib/store.ts` once routes are migrated.

## 4. Stage change webhook

Move webhook out of client/Zustand into the `updateStage` server fn:
- After updating `loans.stage`, build the full payload (loan_id, loan_number, borrower_name from primary borrower, property_address from properties, loan_amount, old_stage, new_stage, ghl_opportunity_id, timestamp).
- `fetch` POST to `https://n8n.voyze.ai/webhook/processing-portal-stage-change` (fire-and-forget, errors logged but don't block).
- `stage_history` row is written by the DB trigger, so it's atomic with the stage update.

## 5. Screens (all live data)

1. **Dashboard** (`/`): 4 stat cards, Pipeline Status panel (stage rows with count + $ volume + horizontal bar), Recent Loans panel. Single `dashboard.functions.ts` server fn.
2. **Loans list** (`/loans`): filter tabs (All/Prospect/Processing/Closing/Funded — mapped to stage groups), columns per spec with avatar+name+loan#+address, stage badge, amount/LTV, last updated. "+ New Loan" button. Pagination (URL search params for `page`, `tab`).
3. **Loan detail** (`/loans/$loanId`): Overview / Notes / Documents tabs. Overview = Borrower Info (1–4 borrowers, add/remove), Property Info, Loan Terms full-width. Stage selector in header. "Generate Term Sheet" placeholder button. Save button per section persists to Supabase.
4. **New Loan** (`/loans/new`): multi-section form, Save Draft (stage=APPLICATION_RECEIVED) + Submit.
5. **Borrowers** (`/borrowers`): list across all loans, click → detail with their loans.
6. **Contacts** (`/contacts`): list with type filter, "+ Contact" creates.

Visual: keep existing dark navy `TopNav`, avatar initials, blue name links, pill stage badges, subtle row hover — already aligned with Arive screenshots. Add a `+ Borrower` / `+ Contact` modal pattern using the shadcn Dialog.

## 6. Cleanup

- Remove Zustand store and mock-data.
- Remove persisted-localStorage logic (Supabase is now source of truth).
- Update `LoanContext`/types to match DB schema (snake_case → camelCase via a small mapper, or use generated Supabase types directly).

## Technical details

- Loan number generation: Postgres sequence `loans_loan_number_seq` + `BEFORE INSERT` trigger formatting `L-{YYYY}-{padded seq}`.
- Stage history trigger: `AFTER UPDATE OF stage ON loans` → insert into `stage_history`, capturing `auth.uid()::text` as `changed_by`.
- `updated_at` trigger on `loans`, `borrowers`, `properties`, `contacts`.
- Webhook call from server fn uses `fetch` with `AbortSignal.timeout(5000)`; failures logged via `console.error`, never thrown to the user.
- Stage filter tab → stage group mapping:
  - Prospect: APPLICATION_RECEIVED, LOAN_SETUP
  - Processing: TITLE_ORDERED, APPRAISAL_ORDERED, SUBMITTED_TO_UW, APPROVED_WITH_CONDITIONS
  - Closing: CLEAR_TO_CLOSE, DOCS_OUT, DOCS_SIGNED
  - Funded: FUNDED

## Out of scope (this pass)

- Document upload (placeholder UI only, per spec).
- Generate Term Sheet action (placeholder button only).
- GHL / Arive sync beyond storing the IDs.
