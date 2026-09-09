import {useCallback,useEffect,useMemo,useState,type ReactNode} from 'react'
import {isAdminAuthConfigured,loginAdmin,logoutAdmin,readAdminSession,type AdminUser} from './authClient'
import {AdminAuthContext,type AdminAuthStatus} from './adminAuthState'

const demoAuthEnabled=import.meta.env.DEV||import.meta.env.VITE_ENABLE_DEMO_DATA==='true'

export function AdminAuthProvider({children}:{children:ReactNode}){
  const configured=isAdminAuthConfigured()
  const [status,setStatus]=useState<AdminAuthStatus>(()=>configured?'loading':demoAuthEnabled?'development':'unavailable')
  const [user,setUser]=useState<AdminUser|null>(null)
  const [error,setError]=useState('')

  const refresh=useCallback(async()=>{
    if(!configured){
      setUser(null)
      setStatus(demoAuthEnabled?'development':'unavailable')
      return
    }
    setStatus('loading')
    setError('')
    try{
      const session=await readAdminSession()
      setUser(session?.user??null)
      setStatus(session?'authenticated':'anonymous')
    }catch(caught){
      setUser(null)
      setError(caught instanceof Error?caught.message:'Não foi possível validar a sessão administrativa.')
      setStatus('unavailable')
    }
  },[configured])

  useEffect(()=>{
    if(!configured)return
    let active=true
    void readAdminSession().then(session=>{
      if(!active)return
      setUser(session?.user??null)
      setStatus(session?'authenticated':'anonymous')
      setError('')
    }).catch(caught=>{
      if(!active)return
      setUser(null)
      setError(caught instanceof Error?caught.message:'Não foi possível validar a sessão administrativa.')
      setStatus('unavailable')
    })
    return()=>{active=false}
  },[configured])

  const login=useCallback(async(input:{email:string;password:string;remember:boolean})=>{
    if(!configured)throw new Error('A API administrativa não está configurada.')
    setError('')
    const session=await loginAdmin(input)
    setUser(session.user)
    setStatus('authenticated')
  },[configured])

  const logout=useCallback(async()=>{
    try{if(configured)await logoutAdmin()}
    finally{
      setUser(null)
      setStatus(configured?'anonymous':demoAuthEnabled?'development':'unavailable')
    }
  },[configured])

  const value=useMemo(()=>({status,user,error,login,logout,refresh}),[status,user,error,login,logout,refresh])
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export {useAdminAuth} from './adminAuthState'
