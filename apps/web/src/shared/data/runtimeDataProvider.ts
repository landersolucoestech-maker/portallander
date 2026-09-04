import type {ApplicationDataProvider} from './dataProvider'

let runtimeProvider:ApplicationDataProvider|null=null

export const hasRuntimeDataProvider=()=>runtimeProvider!==null
export const getRuntimeDataProvider=():ApplicationDataProvider=>{
  if(!runtimeProvider)throw new Error('Runtime data provider is not configured.')
  return runtimeProvider
}
export const setRuntimeDataProvider=(provider:ApplicationDataProvider)=>{runtimeProvider=provider}
export const resetRuntimeDataProvider=()=>{runtimeProvider=null}
