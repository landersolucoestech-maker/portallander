import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import type {SettingsSeed} from './domain'
const KEY='portal-lander:settings:v1'
const EVENT='portal-lander:settings:changed'
const catalogSeed=():SettingsSeed=>getRuntimeDataProvider().settings.seed()
const withCanonicalIntegrations=(seed:SettingsSeed,value:SettingsSeed):SettingsSeed=>({...value,integrations:seed.integrations.filter(item=>item.id!=='website')})
const read=():SettingsSeed=>{const seed=catalogSeed();try{const raw=localStorage.getItem(KEY);return raw?withCanonicalIntegrations(seed,{...seed,...JSON.parse(raw)}):withCanonicalIntegrations(seed,seed)}catch{return withCanonicalIntegrations(seed,seed)}}
const write=(next:SettingsSeed)=>{const seed=catalogSeed();try{localStorage.setItem(KEY,JSON.stringify(withCanonicalIntegrations(seed,next)))}catch{/* storage can be unavailable */}window.dispatchEvent(new Event(EVENT))}
export const settingsRepository={eventName:EVENT,snapshot:read,save(next:SettingsSeed){write(next)},reset(){try{localStorage.removeItem(KEY)}catch{/* storage can be unavailable */}window.dispatchEvent(new Event(EVENT))}}
