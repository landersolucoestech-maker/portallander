import { useEffect, useState } from 'react'
import { readNewsAdConfig, type NewsAdConfig } from '../models/newsAdModel'

export function useNewsAdRuntime(enabled=true){
  const [config,setConfig]=useState<NewsAdConfig>(()=>readNewsAdConfig())
  useEffect(()=>{
    if(!enabled)return
    const sync=()=>setConfig(readNewsAdConfig())
    window.addEventListener('portal-lander:news-ad-updated',sync)
    return()=>window.removeEventListener('portal-lander:news-ad-updated',sync)
  },[enabled])
  return config
}
