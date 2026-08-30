export interface FooterBrandPersistence {
  read(key:string): string | null
  write(key:string,value:string): void
  remove(key:string): void
  notify(): void
}

export class BrowserLocalFooterBrandPersistence implements FooterBrandPersistence {
  read(key:string){if(typeof window==='undefined')return null;return window.localStorage.getItem(key)}
  write(key:string,value:string){if(typeof window==='undefined')return;window.localStorage.setItem(key,value)}
  remove(key:string){if(typeof window==='undefined')return;window.localStorage.removeItem(key)}
  notify(){if(typeof window==='undefined')return;window.dispatchEvent(new CustomEvent('portal-lander:footer-brand-updated'))}
}

export const footerBrandPersistence:FooterBrandPersistence=new BrowserLocalFooterBrandPersistence()
