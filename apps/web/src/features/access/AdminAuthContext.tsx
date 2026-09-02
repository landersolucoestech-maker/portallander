import {useCallback,useMemo,type ReactNode} from 'react'
import {AdminAuthContext,type AdminAuthStatus} from './adminAuthState'

const DEVELOPMENT_STATUS:AdminAuthStatus='development'

export function AdminAuthProvider({children}:{children:ReactNode}){
  const refresh=useCallback(async()=>undefined,[])
  const login=useCallback(async()=>undefined,[])
  const logout=useCallback(async()=>undefined,[])
  const value=useMemo(()=>({status:DEVELOPMENT_STATUS,user:null,error:'',login,logout,refresh}),[login,logout,refresh])
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

// Authentication is intentionally bypassed while the dev branch is under active development.
// The real auth client/API remains in the repository so the gate can be restored before release.
// eslint-disable-next-line react-refresh/only-export-components
export {useAdminAuth} from './adminAuthState'
