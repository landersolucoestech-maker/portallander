import { useQuery } from '@tanstack/react-query'
import {useAdminAuth} from '../../access/adminAuthState'
import { dashboardApi } from '../api'
import type { EditorialActivity } from '../types'

const normalizeLimit=(limit:number)=>Math.min(30,Math.max(1,Number.isFinite(limit)?Math.trunc(limit):30))

export function useActivityHistory(limit=30){
  const safeLimit=normalizeLimit(limit)
  const {status}=useAdminAuth()
  const mode=status==='authenticated'?'api':'development'
  return useQuery<EditorialActivity[]>({
    queryKey:['editorial-activity-history',mode,safeLimit],
    queryFn:()=>mode==='api'?dashboardApi.getAdminActivity(safeLimit):dashboardApi.getActivity(safeLimit),
    staleTime:30_000,
    refetchOnWindowFocus:false,
    retry:1,
  })
}
