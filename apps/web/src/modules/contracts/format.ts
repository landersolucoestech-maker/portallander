import type {CurrencyCode} from './domain'
export const formatCurrency=(value:number|''|undefined,currency:CurrencyCode='BRL')=>typeof value==='number'?new Intl.NumberFormat('pt-BR',{style:'currency',currency}).format(value):'—'
export const formatDate=(value:string|undefined)=>value?new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}${value.length===10?'T12:00:00':''}`)):'—'
export const formatDateTime=(value:string|undefined)=>value?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)):'—'
