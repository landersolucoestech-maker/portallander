export interface HeaderBrandPersistence {
  read(key:string): string | null
  write(key:string,value:string): void
  remove(key:string): void
  notify(): void
}

export class BrowserLocalHeaderBrandPersistence implements HeaderBrandPersistence {
  read(key:string){
    if(typeof window==='undefined')return null
    return window.localStorage.getItem(key)
  }

  write(key:string,value:string){
    if(typeof window==='undefined')return
    window.localStorage.setItem(key,value)
  }

  remove(key:string){
    if(typeof window==='undefined')return
    window.localStorage.removeItem(key)
  }

  notify(){
    if(typeof window==='undefined')return
    window.dispatchEvent(new CustomEvent('portal-lander:header-brand-updated'))
  }
}

export const headerBrandPersistence:HeaderBrandPersistence=new BrowserLocalHeaderBrandPersistence()
