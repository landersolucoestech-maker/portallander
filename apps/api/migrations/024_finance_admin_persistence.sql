begin;

create table if not exists finance_transactions (
  id text primary key default gen_random_uuid()::text,
  transaction_type text not null,
  description text not null,
  category text not null default '',
  subcategory text not null default '',
  status text not null default 'pendente',
  transaction_date date not null,
  due_date date,
  amount numeric(14,2) not null check (amount >= 0),
  counterparty text not null default '',
  document text not null default '',
  payment_method text not null default '',
  payment_type text not null default 'avista',
  installment_count integer,
  installment_interval integer,
  first_installment_date date,
  contract_ref text not null default '',
  contact_ref text,
  supplier_ref text,
  cost_center text not null default '',
  competence text not null default '',
  notes text not null default '',
  attachment_name text,
  attachment_data_url text,
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_transactions_type_check check (transaction_type in ('receita','despesa')),
  constraint finance_transactions_status_check check (status in ('pago','pendente','vencido','cancelado')),
  constraint finance_transactions_payment_type_check check (payment_type in ('avista','parcelado')),
  constraint finance_transactions_installment_count_check check (installment_count is null or installment_count >= 1),
  constraint finance_transactions_installment_interval_check check (installment_interval is null or installment_interval >= 0)
);

create index if not exists idx_finance_transactions_date on finance_transactions(transaction_date desc,created_at desc);
create index if not exists idx_finance_transactions_status on finance_transactions(status,transaction_type,transaction_date desc);
create index if not exists idx_finance_transactions_category on finance_transactions(category,subcategory,transaction_date desc);

drop trigger if exists finance_transactions_set_updated_at on finance_transactions;
create trigger finance_transactions_set_updated_at
before update on finance_transactions
for each row execute function set_portal_updated_at();

create table if not exists finance_invoices (
  id text primary key default gen_random_uuid()::text,
  invoice_number text not null,
  series text not null default '001',
  invoice_type text not null,
  party text not null,
  document text not null default '',
  issue_date date not null,
  due_date date,
  amount numeric(14,2) not null check (amount >= 0),
  status text not null default 'pendente',
  description text not null default '',
  pdf_url text not null default '',
  model text,
  access_key text,
  operation_nature text,
  cfop text,
  entry_exit_date date,
  state_registration text,
  municipal_registration text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  products_amount numeric(14,2),
  freight_amount numeric(14,2),
  insurance_amount numeric(14,2),
  discount_amount numeric(14,2),
  other_expenses numeric(14,2),
  icms_base numeric(14,2),
  icms_amount numeric(14,2),
  ipi_amount numeric(14,2),
  pis_amount numeric(14,2),
  cofins_amount numeric(14,2),
  iss_amount numeric(14,2),
  payment_method text,
  payment_condition text,
  xml_url text,
  additional_info text,
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_invoices_type_check check (invoice_type in ('entrada','saida')),
  constraint finance_invoices_status_check check (status in ('emitida','pendente','paga','cancelada'))
);

create index if not exists idx_finance_invoices_issue_date on finance_invoices(issue_date desc,created_at desc);
create index if not exists idx_finance_invoices_status on finance_invoices(status,invoice_type,issue_date desc);
create index if not exists idx_finance_invoices_number on finance_invoices(invoice_number,series);

drop trigger if exists finance_invoices_set_updated_at on finance_invoices;
create trigger finance_invoices_set_updated_at
before update on finance_invoices
for each row execute function set_portal_updated_at();

create table if not exists finance_categories (
  id text primary key default gen_random_uuid()::text,
  category text not null,
  subcategory text not null,
  transaction_type text not null,
  counterparty text not null default '',
  active boolean not null default true,
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_categories_type_check check (transaction_type in ('receita','despesa'))
);

create index if not exists idx_finance_categories_lookup on finance_categories(active,transaction_type,category,subcategory);

drop trigger if exists finance_categories_set_updated_at on finance_categories;
create trigger finance_categories_set_updated_at
before update on finance_categories
for each row execute function set_portal_updated_at();

create table if not exists finance_rules (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  event_type text not null,
  condition_text text not null,
  action_text text not null,
  active boolean not null default true,
  created_by text references admin_users(id) on delete set null,
  updated_by text references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_rules_event_check check (event_type in ('transaction.created','transaction.paid','invoice.due','contract.signed'))
);

create index if not exists idx_finance_rules_active on finance_rules(active,event_type,created_at desc);

drop trigger if exists finance_rules_set_updated_at on finance_rules;
create trigger finance_rules_set_updated_at
before update on finance_rules
for each row execute function set_portal_updated_at();

comment on table finance_transactions is 'Canonical administrative finance transactions. Authenticated Finance UI persists here instead of browser localStorage.';
comment on table finance_invoices is 'Canonical administrative invoice registry.';
comment on table finance_categories is 'Canonical finance categories and subcategories.';
comment on table finance_rules is 'Canonical finance automation and classification rules.';

commit;
