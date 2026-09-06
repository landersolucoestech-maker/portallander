export type CanonicalSystemFormKey='lead-capture'|'collaborate'
export interface CanonicalSystemFormIdentity{
  key:CanonicalSystemFormKey
  name:string
  slug:string
  purpose:'lead_capture'|'editorial_submission'
  destination:'crm'|'content_collaborations'
  aliases:readonly string[]
}
export const SYSTEM_FORM_DEFINITIONS:Readonly<Record<CanonicalSystemFormKey,CanonicalSystemFormIdentity>>
export const SYSTEM_FORM_KEYS:readonly CanonicalSystemFormKey[]
export const SYSTEM_FORM_CANONICAL_COUNT:number
export function resolveSystemFormKey(value:unknown):CanonicalSystemFormKey|null
export function getSystemFormIdentity(value:unknown):CanonicalSystemFormIdentity|null
export function resolveSystemFormSlug(value:unknown):string|null
export function isReservedSystemFormReference(value:unknown):boolean
