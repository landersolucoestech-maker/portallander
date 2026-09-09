import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {useAdminAuth} from '../access/AdminAuthContext'
import {settingsRepository} from './repository'
import {settingsAdminClient} from './adminClient'
import type {SettingsCompany} from './domain'

const KEY=(mode:'api'|'development')=>['settings',mode,'state'] as const
export function useSettingsRuntime(){const {status}=useAdminAuth();const mode=status==='authenticated'?'api':'development';return {mode,api:mode==='api'} as const}
export function useSettingsState(){const {mode,api}=useSettingsRuntime();return useQuery({queryKey:KEY(mode),queryFn:()=>api?settingsAdminClient.state():Promise.resolve(settingsRepository.snapshot()),staleTime:5_000})}
function useInvalidate(){const qc=useQueryClient(),{mode}=useSettingsRuntime();return()=>qc.invalidateQueries({queryKey:KEY(mode)})}
export function useSaveSettingsCompany(){const {api}=useSettingsRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async(company:SettingsCompany)=>api?settingsAdminClient.saveCompany(company):(settingsRepository.save({...settingsRepository.snapshot(),company}),settingsRepository.snapshot()),onSuccess:invalidate})}
export function useChangeAdminPassword(){const {api}=useSettingsRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async({currentPassword,newPassword}:{currentPassword:string;newPassword:string})=>{if(!api)throw new Error('Troca de senha exige sessão administrativa autenticada.');return settingsAdminClient.changePassword(currentPassword,newPassword)},onSuccess:invalidate})}
export function useRevokeOtherAdminSessions(){const {api}=useSettingsRuntime(),invalidate=useInvalidate();return useMutation({mutationFn:async()=>{if(!api)throw new Error('Gerenciamento de sessões exige sessão administrativa autenticada.');return settingsAdminClient.revokeOtherSessions()},onSuccess:invalidate})}
