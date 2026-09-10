begin;

do $$
begin
  if to_regclass('public.rh_admin_state') is not null and to_regclass('public.hr_admin_state') is null then
    alter table rh_admin_state rename to hr_admin_state;
  end if;
end $$;

do $$
begin
  if exists(select 1 from pg_trigger where tgname='rh_admin_state_set_updated_at' and tgrelid='hr_admin_state'::regclass) then
    alter trigger rh_admin_state_set_updated_at on hr_admin_state rename to hr_admin_state_set_updated_at;
  end if;
end $$;

update hr_admin_state
set payload=jsonb_set(payload,'{employees}',coalesce((
  select jsonb_agg(item || jsonb_build_object(
    'status',case item->>'status' when 'ativo' then 'active' when 'inativo' then 'inactive' when 'férias' then 'vacation' when 'afastado' then 'leave' when 'desligado' then 'terminated' else item->>'status' end,
    'contractType',case item->>'contractType' when 'CLT' then 'clt' when 'PJ' then 'contractor' when 'Estágio' then 'intern' when 'Temporário' then 'temporary' when 'Autônomo' then 'self_employed' else item->>'contractType' end,
    'department',case item->>'department' when 'Administrativo' then 'administration' when 'Comercial' then 'sales' when 'Financeiro' then 'finance' when 'Marketing' then 'marketing' when 'Operações' then 'operations' when 'Tecnologia' then 'technology' else item->>'department' end
  )) from jsonb_array_elements(coalesce(payload->'employees','[]'::jsonb)) item
),'[]'::jsonb),true);

update hr_admin_state
set payload=jsonb_set(payload,'{payroll}',coalesce((
  select jsonb_agg(jsonb_set(item,'{status}',to_jsonb(case item->>'status' when 'pendente' then 'pending' when 'processado' then 'processed' when 'pago' then 'paid' when 'cancelado' then 'cancelled' else item->>'status' end),false)) from jsonb_array_elements(coalesce(payload->'payroll','[]'::jsonb)) item
),'[]'::jsonb),true);

update hr_admin_state
set payload=jsonb_set(payload,'{leaves}',coalesce((
  select jsonb_agg(item || jsonb_build_object(
    'status',case item->>'status' when 'pendente' then 'pending' when 'aprovado' then 'approved' when 'rejeitado' then 'rejected' when 'em andamento' then 'in_progress' when 'concluído' then 'completed' else item->>'status' end,
    'type',case item->>'type' when 'férias' then 'vacation' when 'atestado' then 'medical_certificate' when 'licença médica' then 'medical_leave' when 'licença maternidade/paternidade' then 'parental_leave' when 'falta justificada' then 'justified_absence' when 'afastamento' then 'leave_of_absence' else item->>'type' end
  )) from jsonb_array_elements(coalesce(payload->'leaves','[]'::jsonb)) item
),'[]'::jsonb),true);

update hr_admin_state
set payload=jsonb_set(payload,'{documents}',coalesce((
  select jsonb_agg(item || jsonb_build_object('type',case item->>'type' when 'Contrato de Trabalho' then 'employment_contract' when 'Documento Pessoal' then 'personal_document' when 'Atestado' then 'medical_certificate' when 'Comprovante' then 'proof' when 'Certificado' then 'certificate' when 'Outro' then 'other' else item->>'type' end)) from jsonb_array_elements(coalesce(payload->'documents','[]'::jsonb)) item
),'[]'::jsonb),true);

update hr_admin_state set payload=payload || jsonb_build_object(
  'departments',jsonb_build_array('administration','sales','finance','marketing','operations','technology'),
  'documentTypes',jsonb_build_array('employment_contract','personal_document','medical_certificate','proof','certificate','other'),
  'leaveTypes',jsonb_build_array('vacation','medical_certificate','medical_leave','parental_leave','justified_absence','leave_of_absence')
);

comment on table hr_admin_state is 'Canonical authenticated HR domain state. Technical identifiers and enum values are English.';
comment on column hr_admin_state.payload is 'HR-domain-only JSON state using English technical values.';
comment on column hr_admin_state.updated_by is 'Authenticated admin user responsible for the latest HR mutation.';
commit;
