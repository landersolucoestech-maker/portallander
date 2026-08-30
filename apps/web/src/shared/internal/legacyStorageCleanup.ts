const REMOVED_MODULE_STORAGE_KEYS=[
  'portal-lander:contracts:v1',
  'portal-lander:finance:transactions',
  'portal-lander:finance:invoices',
] as const

export function purgeRemovedModuleStorage(){
  try{
    for(const key of REMOVED_MODULE_STORAGE_KEYS)localStorage.removeItem(key)
  }catch{
    // Storage may be unavailable in restricted browser contexts; module code is already removed.
  }
}
