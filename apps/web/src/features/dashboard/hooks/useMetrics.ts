import { useMemo } from 'react'
import type { PortalDashboard } from '../types'
import { useOperationalDashboard } from './useOperationalDashboard'

export interface DashboardMetrics {
  published:number|null
  drafts:number|null
  publishedThisMonth:number|null
  categories:number|null
}

export function deriveEditorialMetrics(dashboard:PortalDashboard){
  return {
    published:dashboard.published_count,
    drafts:dashboard.draft_count,
    publishedThisMonth:dashboard.published_this_month,
    categories:dashboard.category_count,
  }
}

export function useMetrics(){
  const {dashboard,isLoading,error,refetch}=useOperationalDashboard()
  const metrics=useMemo<DashboardMetrics>(()=>dashboard?deriveEditorialMetrics(dashboard):{published:null,drafts:null,publishedThisMonth:null,categories:null},[dashboard])
  return {metrics,dashboard,isLoading,error,refetch}
}
