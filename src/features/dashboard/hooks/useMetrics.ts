import { useMemo } from 'react'
import { useOperationalDashboard } from './useOperationalDashboard'

export interface DashboardMetrics {
  totalArtistas:number|null
  artistasComContrato:number|null
  artistasAtivos:number|null
  contratosAtivos:number|null
  contratosVencendo:number|null
  receitaMensal:number|null
  eventosMes:number|null
}

export function deriveArtistMetrics(artists:number, byStatus:Record<string,number>){
  return {
    totalArtistas:artists,
    artistasComContrato:byStatus.contratado??0,
    artistasAtivos:(byStatus.ativo??0)+(byStatus.contratado??0),
  }
}

export function useMetrics(){
  const {dashboard,isLoading,error,refetch}=useOperationalDashboard()
  const metrics=useMemo<DashboardMetrics>(()=>{
    if(!dashboard)return {totalArtistas:null,artistasComContrato:null,artistasAtivos:null,contratosAtivos:null,contratosVencendo:null,receitaMensal:null,eventosMes:null}
    const artist=deriveArtistMetrics(dashboard.artists,dashboard.artists_by_status)
    return {
      ...artist,
      contratosAtivos:dashboard.active_contracts_count,
      contratosVencendo:dashboard.contracts_expiring_soon_count,
      receitaMensal:dashboard.revenue_current_month,
      eventosMes:null,
    }
  },[dashboard])
  return {metrics,dashboard,isLoading,error,refetch}
}
