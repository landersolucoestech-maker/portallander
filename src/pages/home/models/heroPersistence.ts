export interface HeroPersistence {
  read(key:string): string | null
  write(key:string,value:string): void
  remove(key:string): void
  notify(): void
}

export class BrowserLocalHeroPersistence implements HeroPersistence {
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
    window.dispatchEvent(new CustomEvent('portal-lander:hero-updated'))
  }
}

/**
 * Adaptador temporário de persistência do Hero.
 * É deliberadamente local ao navegador até existir um backend/storage compartilhado.
 */
export const heroPersistence: HeroPersistence = new BrowserLocalHeroPersistence()
