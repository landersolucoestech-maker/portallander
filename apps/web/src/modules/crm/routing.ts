export type CrmTab='contacts'|'leads'

export function crmTabFromPath(pathname:string):CrmTab{
 return pathname.endsWith('/leads')?'leads':'contacts'
}

export function crmPathForTab(tab:CrmTab){
 return tab==='leads'?'/app/crm/leads':'/app/crm/contatos'
}
