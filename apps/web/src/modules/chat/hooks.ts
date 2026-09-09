import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {useAdminAuth} from '../access/AdminAuthContext'
import {chatAdminClient} from './adminClient'
import type {ChatAutomationSettings,SupportStatus} from './domain'
import {chatRepository} from './repository'

const KEY=(mode:'api'|'development')=>['chat',mode,'state'] as const
export function useChatRuntime(){const {status}=useAdminAuth();const mode=status==='authenticated'?'api':'development';return {mode,api:mode==='api'} as const}
export function useChatState(){const {mode,api}=useChatRuntime();return useQuery({queryKey:KEY(mode),queryFn:()=>api?chatAdminClient.state():Promise.resolve(chatRepository.snapshot()),staleTime:5_000})}
function useInvalidate(){const qc=useQueryClient(),{mode}=useChatRuntime();return()=>qc.invalidateQueries({queryKey:KEY(mode)})}
export function useCreateSupportConversation(){const {api}=useChatRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(input:{customer:string;phone:string;initialMessage?:string})=>api?chatAdminClient.createSupport(input):(chatRepository.createSupport(input),chatRepository.snapshot()),onSuccess:invalidate})}
export function useSendSupportMessage(){const {api}=useChatRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({id,body,internalNote=false}:{id:string;body:string;internalNote?:boolean})=>api?chatAdminClient.sendSupport(id,{body,internalNote}):(chatRepository.sendSupport(id,body,[],internalNote),chatRepository.snapshot()),onSuccess:invalidate})}
export function useSetSupportStatus(){const {api}=useChatRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({id,status}:{id:string;status:SupportStatus})=>api?chatAdminClient.setStatus(id,status):(chatRepository.setStatus(id,status),chatRepository.snapshot()),onSuccess:invalidate})}
export function useTransferSupport(){const {api}=useChatRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({id,assignee}:{id:string;assignee:string})=>api?chatAdminClient.transfer(id,assignee):(chatRepository.transfer(id,assignee),chatRepository.snapshot()),onSuccess:invalidate})}
export function useAddSupportTag(){const {api}=useChatRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({id,tag}:{id:string;tag:string})=>api?chatAdminClient.addTag(id,tag):(chatRepository.addTag(id,tag),chatRepository.snapshot()),onSuccess:invalidate})}
export function useMarkSupportCrm(){const {api}=useChatRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({id,patch}:{id:string;patch:{existingCustomer?:boolean;lead?:string;openDeal?:string;stage?:string}})=>api?chatAdminClient.markCrm(id,patch):(chatRepository.markCrm(id,patch),chatRepository.snapshot()),onSuccess:invalidate})}
export function useCreateInternalConversation(){const {api}=useChatRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(ids:string[])=>api?chatAdminClient.createInternal(ids):(chatRepository.createInternal(ids),chatRepository.snapshot()),onSuccess:invalidate})}
export function useSendInternalMessage(){const {api}=useChatRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({id,body}:{id:string;body:string})=>api?chatAdminClient.sendInternal(id,body):(chatRepository.sendInternal(id,body),chatRepository.snapshot()),onSuccess:invalidate})}
export function useSaveChatAutomation(){const {api}=useChatRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(value:ChatAutomationSettings)=>api?chatAdminClient.saveAutomation(value):(chatRepository.saveAutomation(value),chatRepository.snapshot()),onSuccess:invalidate})}
