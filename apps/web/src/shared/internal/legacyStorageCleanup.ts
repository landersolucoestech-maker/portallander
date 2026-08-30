const REMOVED_MODULE_STORAGE_KEYS=[
  'portal-lander:finance:transactions:v2',
  'portal-lander:finance:invoices:v2',
] as const

export function purgeRemovedModuleStorage(){
  try{
    for(const key of REMOVED_MODULE_STORAGE_KEYS)localStorage.removeItem(key)
  }catch{
    // Storage may be unavailable in restricted browser contexts.
  }
}
