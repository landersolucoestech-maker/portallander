import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api'
import type { OperationalDashboard } from '../types'

export function useOperationalDashboard(){
  const query=useQuery<OperationalDashboard>({
    queryKey:['operational-dashboard'],
    queryFn:dashboardApi.getOperational,
    staleTime:30_000,
    refetchInterval:60_000,
    retry:1,
  })
  return {dashboard:query.data??null,isLoading:query.isLoading,error:query.error,refetch:query.refetch}
}
