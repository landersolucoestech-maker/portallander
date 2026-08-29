export interface HomeAdPersistence {
  read(key:string): string | null
  write(key:string,value:string): void
  remove(key:string): void
  notify(): void
}

export class BrowserLocalHomeAdPersistence implements HomeAdPersistence {
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
    window.dispatchEvent(new CustomEvent('portal-lander:home-ad-updated'))
  }
}

/**
 * Adaptador temporário do anúncio principal da Home.
 * Persistência deliberadamente local ao navegador até existir backend/storage compartilhado.
 */
export const homeAdPersistence: HomeAdPersistence = new BrowserLocalHomeAdPersistence()
