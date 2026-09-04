import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const requiredViewports=[
 {name:'mobile-min',width:320,height:720},
 {name:'mobile-small',width:375,height:812},
 {name:'mobile-standard',width:390,height:844},
 {name:'mobile-large',width:414,height:896},
 {name:'tablet-small',width:768,height:1024},
 {name:'desktop-small',width:1024,height:768},
 {name:'desktop-medium',width:1280,height:800},
 {name:'desktop-large',width:1440,height:900},
 {name:'desktop-xl',width:1920,height:1080},
]
const routes=[
 {route:'/',internal:false},
 {route:'/noticias',internal:false},
 {route:'/noticias/mercado-criativo-em-expansao',internal:false},
 {route:'/anuncie',internal:false},
 {route:'/app/dashboard',internal:true},
 {route:'/app/site/midia-kit',internal:true},
 {route:'/app/site/midia-kit/preview',internal:false},
 {route:'/app/marketing/metricas',internal:true},
]
const safeName=(route:string)=>route==='/'?'home':route.replace(/^\//,'').replaceAll('/','-')
async function openRoute(page:Page,route:string){await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'});await page.locator('#root').waitFor({state:'attached'});await page.waitForFunction(()=>document.querySelector('#root')?.childElementCount!==0);await page.evaluate(async()=>{try{if(document.fonts)await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,1200))])}catch{/* rendering remains testable */}});await page.waitForTimeout(120)}

async function assertNoViewportRegression(page:Page,internal:boolean){
 const result=await page.evaluate(()=>{
  const viewport=window.innerWidth
  const globalWidth=Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)
  const intentionalContainer=(el:HTMLElement)=>{
    let current=el.parentElement
    while(current&&current!==document.body){
      const style=getComputedStyle(current),rect=current.getBoundingClientRect()
      if(current.getAttribute('aria-hidden')==='true'||current.hasAttribute('inert'))return true
      const containsOverflow=current.scrollWidth>current.clientWidth+2
      const clips=style.overflowX==='auto'||style.overflowX==='scroll'||style.overflowX==='hidden'||style.overflow==='auto'||style.overflow==='scroll'||style.overflow==='hidden'
      const namedIntent=/(carousel|slider|scroller|scroll|drawer|offcanvas)/i.test(current.className)
      if(containsOverflow&&(clips||namedIntent)&&rect.right<=viewport+2&&rect.left>=-2)return true
      current=current.parentElement
    }
    return false
  }
  const clipped=Array.from(document.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[role="dialog"]')).filter(el=>{
    const style=getComputedStyle(el),r=el.getBoundingClientRect()
    if(style.display==='none'||style.visibility==='hidden'||style.opacity==='0'||r.width===0||r.height===0)return false
    if(r.right<=viewport+2&&r.left>=-2)return false
    return !intentionalContainer(el)
  }).slice(0,20).map(el=>({tag:el.tagName,text:(el.innerText||el.getAttribute('aria-label')||'').trim().slice(0,80),rect:el.getBoundingClientRect().toJSON()}))
  return {viewport,globalWidth,bodyHeight:document.body.getBoundingClientRect().height,viewportHeight:window.innerHeight,clipped}
 })
 expect(result.globalWidth,'document must not create global horizontal overflow').toBeLessThanOrEqual(result.viewport+2)
 expect(result.bodyHeight,'page must fill the viewport').toBeGreaterThanOrEqual(result.viewportHeight-2)
 expect(result.clipped,'interactive controls outside the viewport must be inside an intentional contained overflow/off-canvas region').toEqual([])
 if(internal){await expect(page.locator('.app-shell')).toBeVisible();await expect(page.locator('.workspace-main')).toBeVisible()}
}

for(const viewport of requiredViewports){
 test.describe(`required breakpoint ${viewport.width}x${viewport.height}`,()=>{
  test.use({viewport:{width:viewport.width,height:viewport.height}})
  for(const item of routes)test(`${item.internal?'internal':'public'} ${item.route}`,async({page})=>{await openRoute(page,item.route);await assertNoViewportRegression(page,item.internal);await page.screenshot({path:`test-results/visual/required-${viewport.name}-${safeName(item.route)}.png`,fullPage:true})})
 })
}
