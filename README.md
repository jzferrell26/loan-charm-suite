# Loan Charm Suite

Internal loan-processing portal for managing loan pipelines, borrowers, contacts, property details, quotes, notes, and stage history.

## Project status

**Working prototype with deployment and backend status to verify.** No GitHub deployment was identified during the July 2026 repository review. The application is connected to Supabase and should not be treated as disposable until backend usage and stored data are confirmed.

**Owner:** `@jzferrell26`
**Last meaningful update on `main`:** 2026-05-22

## What it does

- Authenticates staff through Supabase.
- Shows pipeline totals and recent loans on a dashboard.
- Creates and manages loan records.
- Tracks borrowers, contacts, properties, loan terms, and lenders.
- Captures loan quotes, points, fees, holdbacks, and other deal terms.
- Supports inline record editing.
- Records notes and loan-stage history.
- Keeps external reference fields for systems such as GoHighLevel and Arive.

## Main routes

| Route | Purpose |
|---|---|
| `/login` | Staff authentication |
| `/` | Pipeline dashboard |
| `/loans` | Searchable loan list |
| `/loans/new` | New loan, borrowers, property, and terms |
| `/loans/:loanId` | Loan overview, quote, property, borrowers, notes, and history |
| `/borrowers` | Borrower directory |
| `/contacts` | Contact management |

## Run locally

**Prerequisite:** Node.js with npm and access to an approved Supabase project.

```bash
git clone https://github.com/jzferrell26/loan-charm-suite.git
cd loan-charm-suite
npm install
npm run dev
```

## Configuration

Browser-safe configuration:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public browser key |

Server configuration:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Server-side Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Public key used by authentication middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-only key used by server functions |

Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `VITE_` variable or commit its value.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run format
```

## Technology

- TanStack Start and TanStack Router
- React and TypeScript
- Supabase authentication and database
- TanStack Query
- Vite with Cloudflare integration
- Tailwind CSS, shadcn/ui, and Radix UI

## Data handling

This application models borrower and loan information. Use only approved test data in local environments, keep privileged credentials server-side, and confirm access-control and retention requirements before any production use.

## Preservation note

Branch `cursor/add-cursorrules-and-gap-audit-74f7` contains a unique `scripts/provision-user.mjs` commit that is not on `main`. Review and preserve that script before deleting the branch or cleaning up the repository.

No license file is currently present in this repository.
