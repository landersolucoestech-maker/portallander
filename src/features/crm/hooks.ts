import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {crmRepository} from './repository'
import type {Contact,InteractionType,Lead,LeadStatus} from './domain'

const CRM_KEYS={leads:['crm','leads'] as const,contacts:['crm','contacts'] as const}
const useInvalidate=()=>{const qc=useQueryClient();return()=>Promise.all([qc.invalidateQueries({queryKey:CRM_KEYS.leads}),qc.invalidateQueries({queryKey:CRM_KEYS.contacts})])}
export function useLeads(){return useQuery({queryKey:CRM_KEYS.leads,queryFn:async()=>crmRepository.listLeads(),staleTime:10_000})}
export function useContacts(){return useQuery({queryKey:CRM_KEYS.contacts,queryFn:async()=>crmRepository.listContacts(),staleTime:10_000})}
export function useCreateLead(){const invalidate=useInvalidate();return useMutation({mutationFn:async(input:Parameters<typeof crmRepository.createLead>[0])=>crmRepository.createLead(input),onSuccess:invalidate})}
export function useUpdateLead(){const invalidate=useInvalidate();return useMutation({mutationFn:async({id,patch,expectedUpdatedAt}:{id:string;patch:Partial<Lead>;expectedUpdatedAt?:string})=>crmRepository.updateLead(id,patch,expectedUpdatedAt),onSuccess:invalidate})}
export function useDeleteLead(){const invalidate=useInvalidate();return useMutation({mutationFn:async(leadId:string)=>crmRepository.deleteLead(leadId),onSuccess:invalidate})}
export function useBulkDeleteLeads(){const invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>crmRepository.bulkDeleteLeads(ids),onSuccess:invalidate})}
export function useBulkLeadStatus(){const invalidate=useInvalidate();return useMutation({mutationFn:async({ids,status}:{ids:string[];status:LeadStatus})=>crmRepository.bulkStatus(ids,status),onSuccess:invalidate})}
export function useAddLeadInteraction(){const invalidate=useInvalidate();return useMutation({mutationFn:async({leadId,type,notes,responsible}:{leadId:string;type:InteractionType;notes:string;responsible:string})=>crmRepository.addInteraction(leadId,type,notes,responsible),onSuccess:invalidate})}
export function useConvertLead(){const invalidate=useInvalidate();return useMutation({mutationFn:async(leadId:string)=>crmRepository.convertLead(leadId),onSuccess:invalidate})}
export function useCreateContact(){const invalidate=useInvalidate();return useMutation({mutationFn:async(input:Parameters<typeof crmRepository.createContact>[0])=>crmRepository.createContact(input),onSuccess:invalidate})}
export function useUpdateContact(){const invalidate=useInvalidate();return useMutation({mutationFn:async({id,patch,expectedUpdatedAt}:{id:string;patch:Partial<Contact>;expectedUpdatedAt?:string})=>crmRepository.updateContact(id,patch,expectedUpdatedAt),onSuccess:invalidate})}
export function useDeleteContact(){const invalidate=useInvalidate();return useMutation({mutationFn:async(contactId:string)=>crmRepository.deleteContact(contactId),onSuccess:invalidate})}
export function useBulkDeleteContacts(){const invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>crmRepository.bulkDeleteContacts(ids),onSuccess:invalidate})}
export function useAddContactTimeline(){const invalidate=useInvalidate();return useMutation({mutationFn:async({contactId,type,description}:{contactId:string;type:string;description:string})=>crmRepository.addTimeline(contactId,type,description),onSuccess:invalidate})}
