export interface OperationalDashboard {
  artists: number
  artists_by_status: Record<string, number>
  contracts: number
  contracts_by_status: Record<string, number>
  active_contracts_count: number
  contracts_expiring_soon_count: number
  leads: number
  open_tickets: number
  campaigns: number
  revenue_current_month: number
  expenses_current_month: number
  net_result_current_month: number
  pending_receivables: number
  overdue_invoices_count: number
  paid_transactions_count: number
  cancelled_transactions_count: number
  invoices_by_status: Record<string, number>
  transactions_by_status: Record<string, number>
  transactions_by_tipo: Record<string, number>
  pending_tasks_count: number
  overdue_tasks_count: number
  onboarding_in_progress_count: number
  overdue_followups_count: number
  pending_distribution_setups: number
  pending_external_syncs: number
  failed_external_syncs: number
  successful_external_syncs: number
  distributor_submissions_count: number
  society_submissions_count: number
  external_validation_errors_count: number
  pending_provider_requirements_count: number
  generated_at: string
}

export interface AuditLogRow {
  id: string
  tenant_id?: string | null
  user_id?: string | null
  actor_role?: string | null
  action: string
  entity: string
  entity_id?: string | null
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
  created_at: string
}
