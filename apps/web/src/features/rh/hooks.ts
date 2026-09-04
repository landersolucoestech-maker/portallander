import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {useAdminAuth} from '../access/AdminAuthContext'
import {rhRepository} from './repository'
import {rhAdminClient,type EmployeeDraft,type LeaveDraft,type PayrollDraft} from './adminClient'

const KEY=(mode:'api'|'development')=>['rh',mode,'state'] as const
export function useRhRuntime(){const {status}=useAdminAuth();const mode=status==='authenticated'?'api':'development';return {mode,api:mode==='api'} as const}
export function useRhState(){const {mode,api}=useRhRuntime();return useQuery({queryKey:KEY(mode),queryFn:()=>api?rhAdminClient.state():Promise.resolve(rhRepository.snapshot()),staleTime:5_000})}
function useInvalidate(){const qc=useQueryClient(),{mode}=useRhRuntime();return()=>qc.invalidateQueries({queryKey:KEY(mode)})}
export function useSaveEmployee(){const {api}=useRhRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({value,id}:{value:EmployeeDraft;id?:string})=>api?rhAdminClient.saveEmployee(value,id):(rhRepository.saveEmployee(value,id),rhRepository.snapshot()),onSuccess:invalidate})}
export function useDeleteEmployees(){const {api}=useRhRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>api?rhAdminClient.deleteEmployees(ids):(rhRepository.deleteEmployees(ids),rhRepository.snapshot()),onSuccess:invalidate})}
export function useSavePayroll(){const {api}=useRhRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({value,id}:{value:PayrollDraft;id?:string})=>api?rhAdminClient.savePayroll(value,id):(rhRepository.savePayroll(value,id),rhRepository.snapshot()),onSuccess:invalidate})}
export function useDeletePayroll(){const {api}=useRhRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>api?rhAdminClient.deletePayroll(ids):(rhRepository.deletePayroll(ids),rhRepository.snapshot()),onSuccess:invalidate})}
export function useSaveLeave(){const {api}=useRhRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({value,id}:{value:LeaveDraft;id?:string})=>api?rhAdminClient.saveLeave(value,id):(rhRepository.saveLeave({...value,approvedBy:''},id),rhRepository.snapshot()),onSuccess:invalidate})}
export function useDeleteLeaves(){const {api}=useRhRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>api?rhAdminClient.deleteLeaves(ids):(rhRepository.deleteLeaves(ids),rhRepository.snapshot()),onSuccess:invalidate})}
export function useDeleteRhDocument(){const {api}=useRhRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(id:string)=>api?rhAdminClient.deleteDocument(id):(rhRepository.deleteDocument(id),rhRepository.snapshot()),onSuccess:invalidate})}
