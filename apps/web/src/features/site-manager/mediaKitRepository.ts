import {defaultMediaKitDraft,type MediaKitDraft} from './mediaKitDomain'

const STORAGE_KEY='portal-lander:cms:media-kit-draft:v1'
const EVENT_NAME='portal-lander:media-kit-draft:changed'
const clone=(draft:MediaKitDraft):MediaKitDraft=>structuredClone(draft)

const normalize=(value:unknown):MediaKitDraft=>{
  if(!value||typeof value!=='object')return clone(defaultMediaKitDraft)
  const draft=value as Partial<MediaKitDraft>
  return {
    version:typeof draft.version==='number'&&draft.version>0?draft.version:1,
    status:'draft',
    institutional:{...defaultMediaKitDraft.institutional,...(draft.institutional??{})},
    audience:{...defaultMediaKitDraft.audience,...(draft.audience??{})},
    adFormats:Array.isArray(draft.adFormats)?draft.adFormats.map(item=>({...item})):[],
    commercial:{...defaultMediaKitDraft.commercial,...(draft.commercial??{})},
  }
}

export const mediaKitRepository={
  eventName:EVENT_NAME,
  read():MediaKitDraft{
    try{return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'))}catch{return clone(defaultMediaKitDraft)}
  },
  save(input:MediaKitDraft):MediaKitDraft{
    const draft=normalize(input)
    localStorage.setItem(STORAGE_KEY,JSON.stringify(draft))
    window.dispatchEvent(new CustomEvent(EVENT_NAME))
    return clone(draft)
  },
  reset():MediaKitDraft{
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent(EVENT_NAME))
    return clone(defaultMediaKitDraft)
  },
}
