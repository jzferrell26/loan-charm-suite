
-- =========== helper: updated_at trigger ===========
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =========== loan_number sequence + generator ===========
create sequence if not exists public.loans_number_seq;

create or replace function public.gen_loan_number()
returns trigger language plpgsql as $$
begin
  if new.loan_number is null or new.loan_number = '' then
    new.loan_number := 'L-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.loans_number_seq')::text, 4, '0');
  end if;
  return new;
end $$;

-- =========== loans ===========
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  loan_number text unique,
  stage text not null default 'APPLICATION_RECEIVED'
    check (stage in ('APPLICATION_RECEIVED','LOAN_SETUP','TITLE_ORDERED','APPRAISAL_ORDERED','SUBMITTED_TO_UW','APPROVED_WITH_CONDITIONS','CLEAR_TO_CLOSE','DOCS_OUT','DOCS_SIGNED','FUNDED')),
  loan_purpose text check (loan_purpose in ('Purchase','Refinance','Cash Out')),
  loan_type text check (loan_type in ('Hard Money','Bridge','Fix and Flip','DSCR')),
  loan_amount numeric,
  interest_rate numeric,
  ltv numeric,
  loan_term_months integer,
  points numeric,
  origination_fee numeric,
  maturity_date date,
  arv numeric,
  purchase_price numeric,
  down_payment numeric,
  lender_name text,
  ghl_opportunity_id text,
  arive_loan_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger loans_loan_number before insert on public.loans
  for each row execute function public.gen_loan_number();
create trigger loans_updated_at before update on public.loans
  for each row execute function public.set_updated_at();
create index on public.loans (stage);
create index on public.loans (updated_at desc);

-- =========== borrowers ===========
create table public.borrowers (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  borrower_sequence integer not null check (borrower_sequence between 1 and 4),
  first_name text,
  last_name text,
  email text,
  phone text,
  ssn text,
  dob date,
  address_line text,
  city text,
  state text,
  zip text,
  marital_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (loan_id, borrower_sequence)
);
create trigger borrowers_updated_at before update on public.borrowers
  for each row execute function public.set_updated_at();
create index on public.borrowers (loan_id);

-- =========== properties ===========
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  address_line text,
  city text,
  state text,
  zip text,
  county text,
  property_type text check (property_type in ('Single Family','Multi Family','Condo','Commercial','Land')),
  property_usage text check (property_usage in ('Investment','Primary','Secondary')),
  purchase_price numeric,
  arv numeric,
  appraisal_value numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();
create index on public.properties (loan_id);

-- =========== notes ===========
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  note_text text not null,
  created_by text,
  created_at timestamptz not null default now()
);
create index on public.notes (loan_id, created_at desc);

-- =========== contacts ===========
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  contact_type text check (contact_type in ('Real Estate Agent','Escrow Agent','Title Rep','Attorney','Appraiser')),
  company_name text,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger contacts_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();

-- =========== stage_history ===========
create table public.stage_history (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  old_stage text,
  new_stage text not null,
  changed_at timestamptz not null default now(),
  changed_by text
);
create index on public.stage_history (loan_id, changed_at desc);

create or replace function public.log_stage_change()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.stage is distinct from old.stage then
    insert into public.stage_history (loan_id, old_stage, new_stage, changed_by)
    values (new.id, old.stage, new.stage, coalesce(auth.uid()::text, 'system'));
  end if;
  return new;
end $$;
create trigger loans_stage_history after update of stage on public.loans
  for each row execute function public.log_stage_change();

-- =========== RLS: any authenticated user ===========
alter table public.loans enable row level security;
alter table public.borrowers enable row level security;
alter table public.properties enable row level security;
alter table public.notes enable row level security;
alter table public.contacts enable row level security;
alter table public.stage_history enable row level security;

create policy "auth all loans" on public.loans for all to authenticated using (true) with check (true);
create policy "auth all borrowers" on public.borrowers for all to authenticated using (true) with check (true);
create policy "auth all properties" on public.properties for all to authenticated using (true) with check (true);
create policy "auth all notes" on public.notes for all to authenticated using (true) with check (true);
create policy "auth all contacts" on public.contacts for all to authenticated using (true) with check (true);
create policy "auth read stage_history" on public.stage_history for select to authenticated using (true);
create policy "auth insert stage_history" on public.stage_history for insert to authenticated with check (true);
