import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api'
import type { AuditLogRow } from '../types'

export function useActivityHistory(limit=30){
  return useQuery<AuditLogRow[]>({
    queryKey:['activity-history',limit],
    queryFn:()=>dashboardApi.getActivity(limit),
    staleTime:30_000,
    refetchOnWindowFocus:false,
    retry:1,
  })
}
