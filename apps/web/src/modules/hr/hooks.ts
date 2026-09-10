import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {useAdminAuth} from '../access/AdminAuthContext'
import {hrRepository} from './repository'
import {hrAdminClient,type EmployeeDraft,type LeaveDraft,type PayrollDraft} from './adminClient'

const KEY=(mode:'api'|'development')=>['hr',mode,'state'] as const
export function useHrRuntime(){const {status}=useAdminAuth();const mode=status==='authenticated'?'api':'development';return {mode,api:mode==='api'} as const}
export function useHrState(){const {mode,api}=useHrRuntime();return useQuery({queryKey:KEY(mode),queryFn:()=>api?hrAdminClient.state():Promise.resolve(hrRepository.snapshot()),staleTime:5_000})}
function useInvalidate(){const qc=useQueryClient(),{mode}=useHrRuntime();return()=>qc.invalidateQueries({queryKey:KEY(mode)})}
export function useSaveEmployee(){const {api}=useHrRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({value,id}:{value:EmployeeDraft;id?:string})=>api?hrAdminClient.saveEmployee(value,id):(hrRepository.saveEmployee(value,id),hrRepository.snapshot()),onSuccess:invalidate})}
export function useDeleteEmployees(){const {api}=useHrRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>api?hrAdminClient.deleteEmployees(ids):(hrRepository.deleteEmployees(ids),hrRepository.snapshot()),onSuccess:invalidate})}
export function useSavePayroll(){const {api}=useHrRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({value,id}:{value:PayrollDraft;id?:string})=>api?hrAdminClient.savePayroll(value,id):(hrRepository.savePayroll(value,id),hrRepository.snapshot()),onSuccess:invalidate})}
export function useDeletePayroll(){const {api}=useHrRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>api?hrAdminClient.deletePayroll(ids):(hrRepository.deletePayroll(ids),hrRepository.snapshot()),onSuccess:invalidate})}
export function useSaveLeave(){const {api}=useHrRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({value,id}:{value:LeaveDraft;id?:string})=>api?hrAdminClient.saveLeave(value,id):(hrRepository.saveLeave({...value,approvedBy:''},id),hrRepository.snapshot()),onSuccess:invalidate})}
export function useDeleteLeaves(){const {api}=useHrRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>api?hrAdminClient.deleteLeaves(ids):(hrRepository.deleteLeaves(ids),hrRepository.snapshot()),onSuccess:invalidate})}
export function useDeleteHrDocument(){const {api}=useHrRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(id:string)=>api?hrAdminClient.deleteDocument(id):(hrRepository.deleteDocument(id),hrRepository.snapshot()),onSuccess:invalidate})}
