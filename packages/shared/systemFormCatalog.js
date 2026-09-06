const normalize=value=>String(value??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')

export const SYSTEM_FORM_DEFINITIONS=Object.freeze({
  'lead-capture':Object.freeze({
    key:'lead-capture',
    name:'Contato Comercial',
    slug:'contato-comercial',
    purpose:'lead_capture',
    destination:'crm',
    aliases:Object.freeze(['lead-capture','captacao-leads','captacao-de-leads','contato','contato-comercial']),
  }),
  collaborate:Object.freeze({
    key:'collaborate',
    name:'Colabore / Anuncie',
    slug:'colabore-anuncie',
    purpose:'editorial_submission',
    destination:'content_collaborations',
    aliases:Object.freeze(['collaborate','colabore','anuncie','anuncie-contato','advertising-inquiry','colabore-anuncie','contato-comercial-anuncie']),
  }),
})

export const SYSTEM_FORM_KEYS=Object.freeze(Object.keys(SYSTEM_FORM_DEFINITIONS))
export const SYSTEM_FORM_CANONICAL_COUNT=SYSTEM_FORM_KEYS.length

const aliasToKey=new Map()
for(const definition of Object.values(SYSTEM_FORM_DEFINITIONS)){
  aliasToKey.set(normalize(definition.key),definition.key)
  aliasToKey.set(normalize(definition.slug),definition.key)
  aliasToKey.set(normalize(definition.name),definition.key)
  for(const alias of definition.aliases)aliasToKey.set(normalize(alias),definition.key)
}

export function resolveSystemFormKey(value){return aliasToKey.get(normalize(value))??null}
export function getSystemFormIdentity(value){const key=resolveSystemFormKey(value);return key?SYSTEM_FORM_DEFINITIONS[key]:null}
export function resolveSystemFormSlug(value){return getSystemFormIdentity(value)?.slug??null}
export function isReservedSystemFormReference(value){return resolveSystemFormKey(value)!==null}
