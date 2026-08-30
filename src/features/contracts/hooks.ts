import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {contractsRepository} from './repository'
import type {Contract} from './domain'
const keys={all:['contracts'] as const,contracts:['contracts','list'] as const,templates:['contracts','templates'] as const,categories:['contracts','categories'] as const,variables:['contracts','variables'] as const}
const useInvalidate=()=>{const qc=useQueryClient();return()=>qc.invalidateQueries({queryKey:keys.all})}
export const useContracts=()=>useQuery({queryKey:keys.contracts,queryFn:contractsRepository.listContracts})
export const useContractsByCrmContact=(contactId?:string)=>useQuery({queryKey:['contracts','contact',contactId],queryFn:()=>contractsRepository.listContractsByCrmContact(contactId!),enabled:Boolean(contactId)})
export const useTemplates=()=>useQuery({queryKey:keys.templates,queryFn:contractsRepository.listTemplates})
export const useContractCategories=()=>useQuery({queryKey:keys.categories,queryFn:contractsRepository.listCategories})
export const useContractVariables=()=>useQuery({queryKey:keys.variables,queryFn:contractsRepository.listVariables})
export function useContractMutations(){const invalidate=useInvalidate();return {
 create:useMutation({mutationFn:contractsRepository.createContract,onSuccess:invalidate}),update:useMutation({mutationFn:({id,patch}:{id:string;patch:Partial<Contract>})=>contractsRepository.updateContract(id,patch),onSuccess:invalidate}),remove:useMutation({mutationFn:contractsRepository.deleteContract,onSuccess:invalidate}),bulkRemove:useMutation({mutationFn:contractsRepository.bulkDeleteContracts,onSuccess:invalidate}),
 saveTemplate:useMutation({mutationFn:contractsRepository.saveTemplate,onSuccess:invalidate}),deleteTemplate:useMutation({mutationFn:contractsRepository.deleteTemplate,onSuccess:invalidate}),saveCategory:useMutation({mutationFn:contractsRepository.saveCategory,onSuccess:invalidate}),deleteCategory:useMutation({mutationFn:contractsRepository.deleteCategory,onSuccess:invalidate}),saveVariable:useMutation({mutationFn:contractsRepository.saveVariable,onSuccess:invalidate}),deleteVariable:useMutation({mutationFn:contractsRepository.deleteVariable,onSuccess:invalidate}),
}}
