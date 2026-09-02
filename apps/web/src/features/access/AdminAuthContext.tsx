import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react'
import {isAdminAuthConfigured,loginAdmin,logoutAdmin,readAdminSession,type AdminUser} from './authClient'

type AdminAuthStatus='loading'|'authenticated'|'anonymous'|'unavailable'|'development'

type AdminAuthContextValue={
  status:AdminAuthStatus
  user:AdminUser|null
  error:string
  login:(input:{email:string;password:string;remember:boolean})=>Promise<void>
  logout:()=>Promise<void>
  refresh:()=>Promise<void>
}

const AdminAuthContext=createContext<AdminAuthContextValue|null>(null)

export function AdminAuthProvider({children}:{children:ReactNode}){
  const [status,setStatus]=useState<AdminAuthStatus>('loading')
  const [user,setUser]=useState<AdminUser|null>(null)
  const [error,setError]=useState('')

  const refresh=useCallback(async()=>{
    setError('')
    if(!isAdminAuthConfigured()){
      setUser(null)
      setStatus(import.meta.env.DEV?'development':'unavailable')
      return
    }
    setStatus('loading')
    try{
      const session=await readAdminSession()
      setUser(session?.user??null)
      setStatus(session?'authenticated':'anonymous')
    }catch(caught){
      setUser(null)
      setError(caught instanceof Error?caught.message:'Não foi possível validar a sessão administrativa.')
      setStatus('unavailable')
    }
  },[])

  useEffect(()=>{void refresh()},[refresh])

  const login=useCallback(async(input:{email:string;password:string;remember:boolean})=>{
    setError('')
    const session=await loginAdmin(input)
    setUser(session.user)
    setStatus('authenticated')
  },[])

  const logout=useCallback(async()=>{
    try{if(isAdminAuthConfigured())await logoutAdmin()}finally{setUser(null);setStatus(isAdminAuthConfigured()?'anonymous':import.meta.env.DEV?'development':'unavailable')}
  },[])

  const value=useMemo(()=>({status,user,error,login,logout,refresh}),[status,user,error,login,logout,refresh])
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth(){
  const context=useContext(AdminAuthContext)
  if(!context)throw new Error('useAdminAuth precisa ser usado dentro de AdminAuthProvider.')
  return context
}
