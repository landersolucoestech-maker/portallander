import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const routes=[
 '/app/crm',
 '/app/crm/leads',
 '/app/finance',
 '/app/finance/invoices',
 '/app/finance/categories',
 '/app/finance/rules',
 '/app/contracts',
 '/app/hr',
 '/app/marketing/campaigns',
 '/app/marketing/tasks',
 '/app/marketing/briefings',
 '/app/site/content',
 '/app/site/media',
 '/app/site/forms',
] as const
const viewports=[
 {name:'mobile',width:390,height:844},
 {name:'tablet',width:768,height:1024},
 {name:'desktop',width:1440,height:900},
] as const
const tolerance=2

type Sample={header:string;side:'left'|'center'|'right';headerAnchor:number;triggerAnchor:number;delta:number}

async function openRoute(page:Page,route:string){
 await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
 await page.locator('#root').waitFor({state:'attached'})
 await page.locator('.app-shell .workspace-main').waitFor({state:'visible'})
 await expect(page.getByRole('columnheader',{name:/^Ações$/i}).first(),`${route}: action header must render`).toBeVisible({timeout:12000})
 await expect(page.locator('.table-row-actions-trigger').first(),`${route}: canonical action trigger must render`).toBeVisible({timeout:12000})
 await page.evaluate(async()=>{try{if(document.fonts)await document.fonts.ready}catch{/* geometry remains measurable */}})
}

async function measureTableActions(page:Page):Promise<Sample[]>{
 return page.evaluate(()=>{
  const visible=(element:Element)=>{const rect=(element as HTMLElement).getBoundingClientRect(),style=getComputedStyle(element as HTMLElement);return rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden'}
  const textRect=(element:Element)=>{const node=Array.from(element.childNodes).find(item=>item.nodeType===Node.TEXT_NODE&&/^\s*Ações\s*$/i.test(item.textContent??''));if(!node)return null;const range=document.createRange();range.selectNodeContents(node);return range.getBoundingClientRect()}
  return Array.from(document.querySelectorAll<HTMLTableElement>('table')).flatMap(table=>{
   if(!visible(table))return []
   const headers=Array.from(table.querySelectorAll<HTMLTableCellElement>('thead th'))
   const index=headers.findIndex(header=>/^\s*Ações\s*$/i.test(header.textContent??''))
   if(index<0)return []
   const header=headers[index],headerText=textRect(header)
   const row=Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr')).find(item=>visible(item)&&item.cells[index]?.querySelector('.table-row-actions-trigger'))
   const trigger=row?.cells[index]?.querySelector<HTMLElement>('.table-row-actions-trigger')
   if(!row||!trigger||!headerText||!visible(trigger))return []
   const style=getComputedStyle(header),triggerBox=trigger.getBoundingClientRect()
   const raw=style.textAlign
   const side:'left'|'center'|'right'=raw==='right'||raw==='end'?'right':raw==='center'?'center':'left'
   const headerAnchor=side==='right'?headerText.right:side==='center'?(headerText.left+headerText.right)/2:headerText.left
   const triggerAnchor=side==='right'?triggerBox.right:side==='center'?(triggerBox.left+triggerBox.right)/2:triggerBox.left
   return [{header:`${table.className}::${header.className}`,side,headerAnchor,triggerAnchor,delta:Math.abs(headerAnchor-triggerAnchor)}]
  })
 })
}

for(const viewport of viewports){
 for(const route of routes){
  test(`${route} row action geometry is canonical at ${viewport.name}`,async({page})=>{
   await page.setViewportSize({width:viewport.width,height:viewport.height})
   await openRoute(page,route)
   await expect(page.locator('.crm-row-actions'),`${route}: legacy row action menu must not render`).toHaveCount(0)
   const samples=await measureTableActions(page)
   expect(samples.length,`${route}: action column must be exercised`).toBeGreaterThan(0)
   for(const sample of samples)expect(sample.delta,`${route} ${sample.header}: ${sample.side} action anchor`).toBeLessThanOrEqual(tolerance)
  })
 }
}

test('contract templates use the canonical action menu and aligned action rail',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.goto(`${base}#/app/contracts`,{waitUntil:'domcontentloaded'})
 await page.locator('.app-shell .workspace-main').waitFor({state:'visible'})
 await page.getByRole('button',{name:'Templates',exact:true}).click()
 await page.locator('.contracts-registry-row.head').waitFor({state:'visible'})
 await page.locator('.table-row-actions-trigger').first().waitFor({state:'visible'})
 await expect(page.locator('.crm-row-actions'),'contract templates: legacy row action menu must not render').toHaveCount(0)
 const delta=await page.evaluate(()=>{
  const head=document.querySelector<HTMLElement>('.contracts-registry-row.head')?.lastElementChild as HTMLElement|null
  const trigger=document.querySelector<HTMLElement>('.contracts-registry-row:not(.head) .table-row-actions-trigger')
  if(!head||!trigger)return Number.POSITIVE_INFINITY
  const node=Array.from(head.childNodes).find(item=>item.nodeType===Node.TEXT_NODE&&/^\s*Ações\s*$/i.test(item.textContent??''))
  if(!node)return Number.POSITIVE_INFINITY
  const range=document.createRange();range.selectNodeContents(node);const text=range.getBoundingClientRect(),button=trigger.getBoundingClientRect()
  return Math.abs(text.right-button.right)
 })
 expect(delta,'contract templates: action header and trigger right edge').toBeLessThanOrEqual(tolerance)
})
