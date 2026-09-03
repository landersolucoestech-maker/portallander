import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import type {SettingsSeed} from './domain'
const KEY='portal-lander:settings:v1'
const EVENT='portal-lander:settings:changed'
const withoutLegacyCrmCapture=(value:SettingsSeed):SettingsSeed=>({...value,integrations:value.integrations.filter(item=>item.id!=='website')})
const read=():SettingsSeed=>{const seed=withoutLegacyCrmCapture(getRuntimeDataProvider().settings.seed());try{const raw=localStorage.getItem(KEY);return raw?withoutLegacyCrmCapture({...seed,...JSON.parse(raw)}):seed}catch{return seed}}
const write=(next:SettingsSeed)=>{try{localStorage.setItem(KEY,JSON.stringify(withoutLegacyCrmCapture(next)))}catch{/* storage can be unavailable */}window.dispatchEvent(new Event(EVENT))}
export const settingsRepository={eventName:EVENT,snapshot:read,save(next:SettingsSeed){write(next)},reset(){try{localStorage.removeItem(KEY)}catch{/* storage can be unavailable */}window.dispatchEvent(new Event(EVENT))}}
