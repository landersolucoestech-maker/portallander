import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const routes=[
 {route:'/',internal:false},
 {route:'/noticias',internal:false},
 {route:'/noticias/mercado-criativo-em-expansao',internal:false},
 {route:'/sobre',internal:false},
 {route:'/colabore',internal:false},
 {route:'/contato',internal:false},
 {route:'/anuncie',internal:false},
 {route:'/app/dashboard',internal:true},
 {route:'/app/site/midia-kit',internal:true},
 {route:'/app/site/midia-kit/preview',internal:true},
 {route:'/app/site/formularios/collaborate',internal:true},
 {route:'/app/marketing/metricas',internal:true},
]

async function openRoute(page:Page,route:string){
 await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
 await page.locator('#root').waitFor({state:'attached'})
 await page.waitForFunction(()=>document.querySelector('#root')?.childElementCount!==0)
 await page.waitForTimeout(120)
}

const semanticAudit=async(page:Page)=>page.evaluate(()=>{
 const visible=(el:Element)=>{const node=el as HTMLElement,style=getComputedStyle(node),rect=node.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&style.opacity!=='0'&&rect.width>0&&rect.height>0}
 const text=(el:Element)=>(el.textContent||'').replace(/\s+/g,' ').trim()
 const labelledBy=(el:Element)=>{const ids=(el.getAttribute('aria-labelledby')||'').split(/\s+/).filter(Boolean);return ids.map(id=>document.getElementById(id)).filter(Boolean).map(item=>text(item!)).join(' ').trim()}
 const labelFor=(el:Element)=>{const id=(el as HTMLElement).id;if(!id)return'';const escaped=globalThis.CSS?.escape?CSS.escape(id):id.replace(/[^a-zA-Z0-9_-]/g,'');return text(document.querySelector(`label[for="${escaped}"]`)||document.createElement('span'))}
 const wrappedLabel=(el:Element)=>{const label=el.closest('label');return label?text(label):''}
 const accessibleName=(el:Element)=>{const aria=(el.getAttribute('aria-label')||'').trim();if(aria)return aria;const by=labelledBy(el);if(by)return by;const direct=labelFor(el);if(direct)return direct;const wrapped=wrappedLabel(el);if(wrapped)return wrapped;const title=(el.getAttribute('title')||'').trim();if(title)return title;if(el instanceof HTMLInputElement){if(['button','submit','reset'].includes(el.type)&&el.value.trim())return el.value.trim();if(el.type==='image')return(el.alt||'').trim()}if(el instanceof HTMLImageElement)return(el.alt||'').trim();return text(el)}
 const interactive=Array.from(document.querySelectorAll('button,a[href],input:not([type="hidden"]),select,textarea,[role="button"],[role="link"]')).filter(visible).filter(el=>!(el as HTMLInputElement).disabled)
 const unnamed=interactive.filter(el=>!accessibleName(el)).slice(0,20).map(el=>({tag:el.tagName,role:el.getAttribute('role'),type:el.getAttribute('type'),className:(el as HTMLElement).className}))
 const unlabeledFields=Array.from(document.querySelectorAll('input:not([type="hidden"]),select,textarea')).filter(visible).filter(el=>!accessibleName(el)).slice(0,20).map(el=>({tag:el.tagName,type:el.getAttribute('type'),name:el.getAttribute('name'),id:(el as HTMLElement).id}))
 const imagesWithoutAlt=Array.from(document.images).filter(visible).filter(img=>!img.hasAttribute('alt')).slice(0,20).map(img=>({src:img.getAttribute('src'),className:img.className}))
 const ids=Array.from(document.querySelectorAll<HTMLElement>('[id]')).map(el=>el.id).filter(Boolean)
 const duplicateIds=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))].slice(0,20)
 const hiddenFocusable=Array.from(document.querySelectorAll('[aria-hidden="true"] button,[aria-hidden="true"] a[href],[aria-hidden="true"] input,[aria-hidden="true"] select,[aria-hidden="true"] textarea,[aria-hidden="true"] [tabindex]')).filter(el=>!el.closest('[inert]')&&(el as HTMLElement).tabIndex>=0&&visible(el)).slice(0,20).map(el=>({tag:el.tagName,text:text(el).slice(0,80)}))
 const semanticMain=Array.from(document.querySelectorAll('main,[role="main"]')).filter(visible).length
 return {unnamed,unlabeledFields,imagesWithoutAlt,duplicateIds,hiddenFocusable,semanticMain}
})

const contrastAudit=async(page:Page)=>page.evaluate(()=>{
 const excluded=(el:HTMLElement)=>{
  if(el.closest('[aria-hidden="true"],[hidden],[inert]'))return true
  let cur:HTMLElement|null=el
  while(cur){
   const style=getComputedStyle(cur)
   if(style.display==='none'||style.visibility==='hidden'||style.visibility==='collapse'||style.opacity==='0'||style.contentVisibility==='hidden')return true
   cur=cur.parentElement
  }
  return false
 }
 const visible=(el:HTMLElement)=>{if(excluded(el))return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0}
 const rgba=(value:string)=>{const m=value.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].replaceAll(',',' ').replace('/',' ').split(/\s+/).filter(Boolean).map(Number);if(p.length<3||p.slice(0,3).some(Number.isNaN))return null;return{r:p[0],g:p[1],b:p[2],a:Number.isFinite(p[3])?p[3]:1}}
 const lum=(c:{r:number;g:number;b:number})=>{const f=(v:number)=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)}
 const ratio=(a:{r:number;g:number;b:number},b:{r:number;g:number;b:number})=>{const l1=lum(a),l2=lum(b);return(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)}
 const background=(el:HTMLElement)=>{let cur:HTMLElement|null=el;while(cur){const style=getComputedStyle(cur);if(style.backgroundImage&&style.backgroundImage!=='none')return null;const c=rgba(style.backgroundColor);if(c&&c.a>=.98)return c;cur=cur.parentElement}return null}
 const candidates=Array.from(document.querySelectorAll<HTMLElement>('h1,h2,h3,h4,p,li,label,button,a,small,span')).filter(visible).filter(el=>(el.textContent||'').trim().length>0)
 const violations=[] as Array<{tag:string;text:string,ratio:number,required:number,color:string,background:string}>
 for(const el of candidates){const style=getComputedStyle(el),fg=rgba(style.color),bg=background(el);if(!fg||!bg||fg.a<.98)continue;const fontSize=parseFloat(style.fontSize)||16,weight=Number.parseInt(style.fontWeight,10)||400,large=fontSize>=24||(fontSize>=18.66&&weight>=700),required=large?3:4.5,actual=ratio(fg,bg);if(actual+0.05<required)violations.push({tag:el.tagName,text:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,90),ratio:Number(actual.toFixed(2)),required,color:style.color,background:`rgb(${bg.r}, ${bg.g}, ${bg.b})`});if(violations.length>=30)break}
 return violations
})

for(const item of routes){
 test(`semantic accessibility ${item.route}`,async({page})=>{await openRoute(page,item.route);const result=await semanticAudit(page);expect(result.unnamed,'visible interactive controls need accessible names').toEqual([]);expect(result.unlabeledFields,'visible form controls need labels or accessible names').toEqual([]);expect(result.imagesWithoutAlt,'visible images need an alt attribute').toEqual([]);expect(result.duplicateIds,'document IDs must be unique').toEqual([]);expect(result.hiddenFocusable,'aria-hidden containers cannot expose focusable descendants').toEqual([]);expect(result.semanticMain,'each rendered route must expose a semantic main landmark').toBeGreaterThanOrEqual(1)})
 test(`keyboard focus ${item.route}`,async({page})=>{await openRoute(page,item.route);await page.keyboard.press('Tab');const focused=await page.evaluate(()=>({tag:document.activeElement?.tagName||'',body:document.activeElement===document.body,focusVisible:document.activeElement instanceof HTMLElement&&document.activeElement.matches(':focus-visible')}));expect(focused.body).toBe(false);expect(focused.tag).not.toBe('');expect(focused.focusVisible).toBe(true)})
}

test('accessibility tree exposes the primary document landmark',async({page})=>{await openRoute(page,'/');expect(await page.locator('body').ariaSnapshot()).toContain('main')})
for(const route of ['/', '/noticias', '/sobre', '/anuncie', '/app/dashboard', '/app/site/midia-kit', '/app/site/midia-kit/preview'])test(`measurable text contrast ${route}`,async({page})=>{await openRoute(page,route);expect(await contrastAudit(page),'measurable foreground/background text pairs must meet WCAG AA contrast').toEqual([])})
