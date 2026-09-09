import {createContext,useContext} from 'react'
import type {AdminUser} from './authClient'

export type AdminAuthStatus='loading'|'authenticated'|'anonymous'|'unavailable'|'development'

export type AdminAuthContextValue={
  status:AdminAuthStatus
  user:AdminUser|null
  error:string
  login:(input:{email:string;password:string;remember:boolean})=>Promise<void>
  logout:()=>Promise<void>
  refresh:()=>Promise<void>
}

export const AdminAuthContext=createContext<AdminAuthContextValue|null>(null)

export function useAdminAuth(){
  const context=useContext(AdminAuthContext)
  if(!context)throw new Error('useAdminAuth precisa ser usado dentro de AdminAuthProvider.')
  return context
}
