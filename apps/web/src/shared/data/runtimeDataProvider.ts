import type {ApplicationDataProvider} from './dataProvider'
import {mockDataProvider} from './mockDataProvider'

let runtimeProvider:ApplicationDataProvider=mockDataProvider
export const getRuntimeDataProvider=()=>runtimeProvider
export const setRuntimeDataProvider=(provider:ApplicationDataProvider)=>{runtimeProvider=provider}
