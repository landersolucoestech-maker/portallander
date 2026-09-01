export type SidebarAdConfig = {
  active:boolean
  title:string
  subtitle:string
  linkLabel:string
  linkUrl:string
  source:string
  quantity:number
  width:number
  height:number
  paddingX:number
  paddingY:number
  radius:number
  background:string
  textColor:string
  titleColor:string
  accentColor:string
  borderColor:string
  bodyLines:string[]
  imageUrl:string
  imageAlt:string
  imageStored?:boolean
}

export const SIDEBAR_AD_STORAGE_KEY='portal-lander:cms:section-config:side-ad:v4'
export const SIDEBAR_AD_UPDATED_EVENT='portal-lander:side-ad-updated'
const DB_NAME='portal-lander-cms-media'
const STORE_NAME='media'
const MEDIA_KEY='home-side-ad-image'

function openDb():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,1)
    request.onupgradeneeded=()=>{
      const db=request.result
      if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME)
    }
    request.onsuccess=()=>resolve(request.result)
    request.onerror=()=>reject(request.error??new Error('Falha ao abrir armazenamento de mídia.'))
  })
}

async function putMedia(blob:Blob){
  const db=await openDb()
  await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite')
    tx.objectStore(STORE_NAME).put(blob,MEDIA_KEY)
    tx.oncomplete=()=>resolve()
    tx.onerror=()=>reject(tx.error??new Error('Falha ao salvar imagem.'))
  })
  db.close()
}

async function getMedia():Promise<Blob|null>{
  const db=await openDb()
  const result=await new Promise<Blob|null>((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readonly')
    const request=tx.objectStore(STORE_NAME).get(MEDIA_KEY)
    request.onsuccess=()=>resolve(request.result instanceof Blob?request.result:null)
    request.onerror=()=>reject(request.error??new Error('Falha ao ler imagem.'))
  })
  db.close()
  return result
}

async function deleteMedia(){
  const db=await openDb()
  await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite')
    tx.objectStore(STORE_NAME).delete(MEDIA_KEY)
    tx.oncomplete=()=>resolve()
    tx.onerror=()=>reject(tx.error??new Error('Falha ao remover imagem.'))
  })
  db.close()
}

function dataUrlToBlob(dataUrl:string):Blob{
  const [meta,payload]=dataUrl.split(',')
  const mime=meta.match(/data:([^;]+)/)?.[1]??'application/octet-stream'
  const binary=atob(payload)
  const bytes=new Uint8Array(binary.length)
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i)
  return new Blob([bytes],{type:mime})
}

export async function saveSidebarAdConfig(config:SidebarAdConfig){
  const persisted:{[key:string]:unknown}={...config}
  if(config.imageUrl.startsWith('data:')){
    await putMedia(dataUrlToBlob(config.imageUrl))
    persisted.imageUrl=''
    persisted.imageStored=true
  }else if(config.imageUrl){
    await deleteMedia()
    persisted.imageStored=false
  }else{
    await deleteMedia()
    persisted.imageStored=false
  }
  localStorage.setItem(SIDEBAR_AD_STORAGE_KEY,JSON.stringify(persisted))
  window.dispatchEvent(new CustomEvent(SIDEBAR_AD_UPDATED_EVENT))
}

export async function loadSidebarAdConfig<T extends SidebarAdConfig>(defaults:T):Promise<T>{
  let merged:T=defaults
  try{
    const raw=localStorage.getItem(SIDEBAR_AD_STORAGE_KEY)
    if(raw)merged={...defaults,...JSON.parse(raw)}
  }catch{return defaults}
  if(merged.imageStored&&!merged.imageUrl){
    try{
      const blob=await getMedia()
      if(blob)merged={...merged,imageUrl:URL.createObjectURL(blob)}
    }catch{/* metadata remains usable even if media storage fails */}
  }
  return merged
}
