import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {useAdminAuth} from '../access/AdminAuthContext'
import {crmAdminClient} from './adminClient'
import {crmRepository} from './repository'
import type {Contact,InteractionType,Lead,LeadStatus} from './domain'

const queryKey=(mode:'api'|'development',resource:'leads'|'contacts')=>['crm',mode,resource] as const
function useCrmRuntime(){
 const {status}=useAdminAuth()
 const mode=status==='authenticated'?'api':'development'
 return {mode,api:mode==='api'} as const
}
const useInvalidate=()=>{const qc=useQueryClient();const {mode}=useCrmRuntime();return()=>Promise.all([qc.invalidateQueries({queryKey:queryKey(mode,'leads')}),qc.invalidateQueries({queryKey:queryKey(mode,'contacts')})])}
export function useLeads(){const {mode,api}=useCrmRuntime();return useQuery({queryKey:queryKey(mode,'leads'),queryFn:()=>api?crmAdminClient.listLeads():Promise.resolve(crmRepository.listLeads()),staleTime:10_000})}
export function useContacts(){const {mode,api}=useCrmRuntime();return useQuery({queryKey:queryKey(mode,'contacts'),queryFn:()=>api?crmAdminClient.listContacts():Promise.resolve(crmRepository.listContacts()),staleTime:10_000})}
export function useCreateLead(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(input:Parameters<typeof crmRepository.createLead>[0])=>api?crmAdminClient.createLead(input):crmRepository.createLead(input),onSuccess:invalidate})}
export function useUpdateLead(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({id,patch,expectedUpdatedAt}:{id:string;patch:Partial<Lead>;expectedUpdatedAt?:string})=>api?crmAdminClient.updateLead(id,patch,expectedUpdatedAt):crmRepository.updateLead(id,patch,expectedUpdatedAt),onSuccess:invalidate})}
export function useDeleteLead(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(leadId:string)=>api?crmAdminClient.deleteLead(leadId):crmRepository.deleteLead(leadId),onSuccess:invalidate})}
export function useBulkDeleteLeads(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>api?crmAdminClient.bulkDeleteLeads(ids):crmRepository.bulkDeleteLeads(ids),onSuccess:invalidate})}
export function useBulkLeadStatus(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({ids,status}:{ids:string[];status:LeadStatus})=>api?crmAdminClient.bulkStatus(ids,status):crmRepository.bulkStatus(ids,status),onSuccess:invalidate})}
export function useAddLeadInteraction(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({leadId,type,notes,responsible}:{leadId:string;type:InteractionType;notes:string;responsible:string})=>api?crmAdminClient.addInteraction(leadId,type,notes,responsible):crmRepository.addInteraction(leadId,type,notes,responsible),onSuccess:invalidate})}
export function useConvertLead(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(leadId:string)=>api?crmAdminClient.convertLead(leadId):crmRepository.convertLead(leadId),onSuccess:invalidate})}
export function useCreateContact(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(input:Parameters<typeof crmRepository.createContact>[0])=>api?crmAdminClient.createContact(input):crmRepository.createContact(input),onSuccess:invalidate})}
export function useUpdateContact(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({id,patch,expectedUpdatedAt}:{id:string;patch:Partial<Contact>;expectedUpdatedAt?:string})=>api?crmAdminClient.updateContact(id,patch,expectedUpdatedAt):crmRepository.updateContact(id,patch,expectedUpdatedAt),onSuccess:invalidate})}
export function useDeleteContact(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(contactId:string)=>api?crmAdminClient.deleteContact(contactId):crmRepository.deleteContact(contactId),onSuccess:invalidate})}
export function useBulkDeleteContacts(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>api?crmAdminClient.bulkDeleteContacts(ids):crmRepository.bulkDeleteContacts(ids),onSuccess:invalidate})}
export function useAddContactTimeline(){const {api}=useCrmRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({contactId,type,description}:{contactId:string;type:string;description:string})=>api?crmAdminClient.addTimeline(contactId,type,description):crmRepository.addTimeline(contactId,type,description),onSuccess:invalidate})}
