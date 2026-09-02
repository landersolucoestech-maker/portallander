import type {EditorialAdminCredentials} from './apiClient'

const STORAGE_KEY='portal-lander:editorial-admin-session:v1'
const EVENT_NAME='portal-lander:editorial-admin-session:changed'

const emit=()=>window.dispatchEvent(new CustomEvent(EVENT_NAME))

export const editorialAdminSession={
  eventName:EVENT_NAME,
  read():EditorialAdminCredentials|null{
    try{
      const accessToken=sessionStorage.getItem(STORAGE_KEY)?.trim()||''
      return accessToken?{accessToken}:null
    }catch{return null}
  },
  write(accessToken:string){
    const value=accessToken.trim()
    if(!value){this.clear();return}
    sessionStorage.setItem(STORAGE_KEY,value)
    emit()
  },
  clear(){
    sessionStorage.removeItem(STORAGE_KEY)
    emit()
  },
}
