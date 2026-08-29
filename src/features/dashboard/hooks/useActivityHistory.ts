import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api'
import type { AuditLogRow } from '../types'

const normalizeLimit=(limit:number)=>Math.min(100,Math.max(1,Number.isFinite(limit)?Math.trunc(limit):30))

export function useActivityHistory(limit=30){
  const safeLimit=normalizeLimit(limit)
  return useQuery<AuditLogRow[]>({
    queryKey:['activity-history',safeLimit],
    queryFn:()=>dashboardApi.getActivity(safeLimit),
    staleTime:30_000,
    refetchOnWindowFocus:false,
    retry:1,
  })
}
