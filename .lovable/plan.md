# Processing Portal — Build Plan

Internal loan ops tool for 3 users. Visual match to Arive (dark navy top nav, white content, dense list views, pill badges, avatar initials, blue name links). All data mocked in-memory; only live integration is the stage-change webhook.

## Tech & structure

- TanStack Start file-based routes under `src/routes/`
- Shared layout in `__root.tsx` with `<TopNav />` (dark navy) + white `<main>`
- Mock data + in-memory store in `src/lib/mock-data.ts` + `src/lib/store.ts` (Zustand or simple React context) so stage changes persist across navigation within a session
- Reusable primitives: `Avatar` (initials + deterministic color from name hash), `StageBadge` (pill, color per stage), `DataTable` row styles, `Tabs`
- Webhook helper `src/lib/webhook.ts` → `POST https://n8n.voyze.ai/webhook/processing-portal-stage-change` with `{ loan_id, borrower_name, old_stage, new_stage, timestamp }`, fire-and-forget, errors swallowed + toast

## Design tokens (src/styles.css)

- `--nav: oklch(...)` dark navy matching Arive (~#0F1B3D)
- `--link: oklch(...)` Arive blue (~#2563EB)
- Stage palette tokens: prospect (blue), processing (amber/purple), closing (orange), funded (green)
- Inter font, tight row density (h ~64px), 1px subtle borders, `hover:bg-muted/40`

## Routes

1. `/` → Dashboard
   - 4 stat cards (Active Loans, Total Volume, Conditions Pending, Closing This Month) computed from mock loans
   - Left: Pipeline Status grouped Prospect / Processing / Closing with count + $ + horizontal bar
   - Right: Recent Loans list (avatar, name link, loan type, "Xd ago")
2. `/loans` → Loans list
   - Tabs: All · Prospect · Processing · Closing · Funded (filters in-memory store)
   - Columns per spec; status cell shows `StageBadge` + ITP/Appraisal/Title checkbox trackers
   - `+ New Loan` → `/loans/new`
   - Row click → `/loans/$loanId`
   - Pagination (client-side, 10/page)
3. `/loans/$loanId` → Deal Detail
   - Header: borrower name, loan #, **Stage selector** dropdown (fires webhook on change, updates store), `Generate Term Sheet` button (no-op + toast)
   - Tabs: Overview (3-column Borrower / Property / Loan Terms cards, SSN masked) · Notes (timestamped feed + textarea + Add Note, stored in memory) · Documents (drag-drop placeholder + mock file list)
4. `/loans/new` → New Loan form
   - 3 sections matching Overview fields; `Save as Draft` and `Submit` both push to store and route to detail
5. `/borrowers` → Borrowers list (avatar, name link, email, phone, created, updated, address; sort by Last Updated; `+ Borrower`)
6. `/contacts` → Contacts list (avatar, name, type, company, email, phone, last updated; filter dropdowns All Contact Types / All Company Types; `+ Contact`)

Each route gets its own `head()` with title.

## Mock data

- ~15 loans across all stages with realistic borrower names, property addresses, amounts, LTV, lender names
- ~20 borrowers, ~15 contacts (Real Estate Agent, Escrow Agent, Title Rep, Attorney)

## Stage webhook flow

`updateLoanStage(loanId, newStage)` in store:
1. capture `oldStage`
2. update store
3. `fetch(webhookUrl, { method: 'POST', body: JSON.stringify({...}), keepalive: true }).catch(noop)`
4. toast "Stage updated"

Used by both Loans list (if inline change added later) and Deal Detail dropdown.

## Out of scope (V1)

- Auth, backend, real file storage, term sheet generation, Tasks/Reports/Pricing/Leads nav items
