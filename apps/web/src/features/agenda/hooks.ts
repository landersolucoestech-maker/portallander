import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {useAdminAuth} from '../access/AdminAuthContext'
import {agendaAdminClient} from './adminClient'
import type {AgendaEventDraft} from './domain'
import {agendaRepository} from './repository'

const EVENTS_KEY=(mode:'api'|'development')=>['agenda',mode,'events'] as const
export function useAgendaRuntime(){
  const {status}=useAdminAuth()
  const mode=status==='authenticated'?'api':'development'
  const api=mode==='api'
  const lookups=api
    ?{participants:[],locations:[],available:false as const,reason:'Catálogos canônicos de participantes e locais ainda não possuem API própria; informe localização manualmente quando necessário.'}
    :{participants:agendaRepository.participants(),locations:agendaRepository.locations(),available:true as const,reason:''}
  return {mode,api,lookups} as const
}
export function useAgendaEvents(){const {mode,api}=useAgendaRuntime();return useQuery({queryKey:EVENTS_KEY(mode),queryFn:()=>api?agendaAdminClient.list():Promise.resolve(agendaRepository.list()),staleTime:10_000})}
function useInvalidateAgenda(){const qc=useQueryClient(),{mode}=useAgendaRuntime();return()=>qc.invalidateQueries({queryKey:EVENTS_KEY(mode)})}
export function useCreateAgendaEvent(){const {api}=useAgendaRuntime(),invalidate=useInvalidateAgenda();return useMutation({mutationFn:(draft:AgendaEventDraft)=>api?agendaAdminClient.create(draft):Promise.resolve(agendaRepository.create(draft)),onSuccess:invalidate})}
export function useUpdateAgendaEvent(){const {api}=useAgendaRuntime(),invalidate=useInvalidateAgenda();return useMutation({mutationFn:({id,draft,expectedUpdatedAt}:{id:string;draft:AgendaEventDraft;expectedUpdatedAt?:string})=>api?agendaAdminClient.update(id,draft,expectedUpdatedAt):Promise.resolve(agendaRepository.update(id,draft)),onSuccess:invalidate})}
export function useDeleteAgendaEvent(){const {api}=useAgendaRuntime(),invalidate=useInvalidateAgenda();return useMutation({mutationFn:(id:string)=>api?agendaAdminClient.remove(id):Promise.resolve(agendaRepository.remove(id)),onSuccess:invalidate})}
