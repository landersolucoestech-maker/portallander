import {getRuntimeDataProvider} from '../../shared/data/runtimeDataProvider'
import type {SettingsSeed} from './domain'
const KEY='portal-lander:settings:v1'
const EVENT='portal-lander:settings:changed'
const read=():SettingsSeed=>{const seed=getRuntimeDataProvider().settings.seed();try{const raw=localStorage.getItem(KEY);return raw?{...seed,...JSON.parse(raw)}:seed}catch{return seed}}
const write=(next:SettingsSeed)=>{try{localStorage.setItem(KEY,JSON.stringify(next))}catch{/* storage can be unavailable */}window.dispatchEvent(new Event(EVENT))}
export const settingsRepository={eventName:EVENT,snapshot:read,save(next:SettingsSeed){write(next)},reset(){try{localStorage.removeItem(KEY)}catch{/* storage can be unavailable */}window.dispatchEvent(new Event(EVENT))}}
