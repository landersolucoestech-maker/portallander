import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const internalRoutes=[
 '/app/profile','/app/dashboard','/app/crm','/app/contracts','/app/agenda','/app/chat','/app/chat/settings','/app/rh',
 '/app/marketing','/app/marketing/campanhas','/app/marketing/calendario','/app/marketing/tarefas',
 '/app/marketing/metricas','/app/marketing/briefings','/app/marketing/ia-criativa',
 '/app/reports','/app/settings','/app/finance','/app/finance/invoices','/app/finance/accounting','/app/finance/rules','/app/finance/categories',
 '/app/site','/app/site/home','/app/site/home/hero','/app/site/home/anuncio','/app/site/marca','/app/site/cabecalho',
 '/app/site/conteudos','/app/site/paginas','/app/site/categorias','/app/site/midia','/app/site/noticias/anuncio','/app/site/midia-kit'
]
const accessRoutes=['/app/login','/app/workspaces']
const publicRoutes=['/','/noticias','/colabore','/anuncie']
const viewports=[
 {name:'desktop-large',width:1680,height:1050},
 {name:'desktop',width:1440,height:900},
 {name:'notebook',width:1280,height:800},
 {name:'tablet',width:834,height:1112},
 {name:'mobile',width:390,height:844},
]

const safeName=(route:string)=>route==='/'?'home':route.replace(/^\//,'').replaceAll('/','-')

async function openRoute(page:Page,route:string){
 await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
 await page.locator('#root').waitFor({state:'attached'})
 await page.waitForFunction(()=>document.querySelector('#root')?.childElementCount!==0)
 await page.evaluate(async()=>{try{if(document.fonts)await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,1200))])}catch{/* visual audit still validates fallback rendering */}})
 await page.waitForTimeout(120)
}

async function assertViewportIntegrity(page:Page,internal:boolean){
 const dimensions=await page.evaluate(()=>({
   bodyScrollWidth:document.body.scrollWidth,
   docScrollWidth:document.documentElement.scrollWidth,
   viewport:window.innerWidth,
   bodyHeight:document.body.getBoundingClientRect().height,
   viewportHeight:window.innerHeight,
 }))
 expect(Math.max(dimensions.bodyScrollWidth,dimensions.docScrollWidth),'document must not create horizontal overflow').toBeLessThanOrEqual(dimensions.viewport+2)
 expect(dimensions.bodyHeight,'page must fill the viewport').toBeGreaterThanOrEqual(dimensions.viewportHeight-2)
 if(internal){
   await expect(page.locator('.app-shell')).toBeVisible()
   await expect(page.locator('.workspace-top')).toBeVisible()
   await expect(page.locator('.account-button')).toBeVisible()
   await expect(page.locator('.workspace-main')).toBeVisible()
 }
}

for(const viewport of viewports){
 test.describe(`${viewport.name} ${viewport.width}x${viewport.height}`,()=>{
   test.use({viewport:{width:viewport.width,height:viewport.height}})
   for(const route of internalRoutes){
     test(`internal ${route}`,async({page})=>{
       await openRoute(page,route)
       await assertViewportIntegrity(page,true)
       if(viewport.name==='mobile'&&(await page.locator('.workspace-primary-action').count())>0){
         await expect(page.locator('.workspace-primary-action').first()).toBeVisible()
       }
       await page.screenshot({path:`test-results/visual/${viewport.name}-${safeName(route)}.png`,fullPage:true})
     })
   }
   for(const route of accessRoutes){
     test(`access ${route}`,async({page})=>{
       await openRoute(page,route)
       await assertViewportIntegrity(page,false)
       await expect(page.locator('.access-page,.workspace-selection-page').first()).toBeVisible()
       await page.screenshot({path:`test-results/visual/${viewport.name}-access-${safeName(route)}.png`,fullPage:true})
     })
   }
   for(const route of publicRoutes){
     test(`public ${route}`,async({page})=>{
       await openRoute(page,route)
       await assertViewportIntegrity(page,false)
       await page.screenshot({path:`test-results/visual/${viewport.name}-public-${safeName(route)}.png`,fullPage:true})
     })
   }
 })
}

test.describe('modal viewport integrity',()=>{
 test.use({viewport:{width:390,height:844}})
 const cases=[
   {route:'/app/crm',button:/Novo Contato/i},
   {route:'/app/agenda',button:/Novo Evento/i},
   {route:'/app/finance',button:/Nova Transação/i},
   {route:'/app/marketing/campanhas',button:/Nova Campanha/i},
 ]
 for(const item of cases){
   test(`${item.route} modal remains inside mobile viewport`,async({page})=>{
     await openRoute(page,item.route)
     const button=page.getByRole('button',{name:item.button}).first()
     if((await button.count())===0)test.skip(true,`No action matching ${item.button}`)
     await button.click()
     const modal=page.locator('[role="dialog"],.crm-modal,.agenda-modal,.finance-modal,.marketing-modal,.rh-modal,.reports-import-dialog,.settings-modal').first()
     await expect(modal).toBeVisible()
     const box=await modal.boundingBox()
     expect(box).not.toBeNull()
     if(box){
       expect(box.x).toBeGreaterThanOrEqual(0)
       expect(box.y).toBeGreaterThanOrEqual(0)
       expect(box.x+box.width).toBeLessThanOrEqual(392)
       expect(box.y+box.height).toBeLessThanOrEqual(846)
     }
   })
 }
})
