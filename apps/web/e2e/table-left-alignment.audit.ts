import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const routes=[
  '/app/crm/contatos',
  '/app/crm/leads',
  '/app/contracts',
  '/app/finance',
  '/app/finance/invoices',
  '/app/finance/accounting',
  '/app/finance/rules',
  '/app/finance/categories',
  '/app/hr',
  '/app/marketing',
  '/app/settings',
] as const

async function openRoute(page:Page,route:string){
  await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
  await page.locator('#root').waitFor({state:'attached'})
  await page.locator('.app-shell .workspace-main').waitFor({state:'visible'})
  await page.evaluate(async()=>{try{if(document.fonts)await document.fonts.ready}catch{/* computed alignment remains measurable */}})
  await page.waitForTimeout(80)
}

test('every administrative TableView uses one left alignment axis',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  let exercisedTables=0
  let exercisedCells=0

  for(const route of routes){
    await openRoute(page,route)
    const sample=await page.evaluate(()=>{
      const visible=(node:HTMLElement)=>{
        const rect=node.getBoundingClientRect()
        const style=getComputedStyle(node)
        return rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden'
      }
      const tables=Array.from(document.querySelectorAll<HTMLTableElement>('.app-shell .workspace-main table:not(.tableview-freeform)')).filter(visible)
      const cells=tables.flatMap(table=>Array.from(table.querySelectorAll<HTMLElement>('th,td')).filter(visible))
      const sortHeaders=tables.flatMap(table=>Array.from(table.querySelectorAll<HTMLElement>('.crm-sort-header')).filter(visible))
      const rowActions=tables.flatMap(table=>Array.from(table.querySelectorAll<HTMLElement>('.table-row-actions')).filter(visible))
      return {
        tables:tables.length,
        cells:cells.map(node=>({tag:node.tagName,className:node.className,textAlign:getComputedStyle(node).textAlign})),
        sortHeaders:sortHeaders.map(node=>getComputedStyle(node).justifyContent),
        rowActions:rowActions.map(node=>getComputedStyle(node).justifyContent),
      }
    })

    exercisedTables+=sample.tables
    exercisedCells+=sample.cells.length
    for(const cell of sample.cells)expect(cell.textAlign,`${route} ${cell.tag}.${cell.className}: TableView cell axis`).toBe('left')
    for(const alignment of sample.sortHeaders)expect(alignment,`${route}: sortable header axis`).toBe('flex-start')
    for(const alignment of sample.rowActions)expect(alignment,`${route}: row actions axis`).toBe('flex-start')
  }

  expect(exercisedTables,'administrative TableViews must be exercised').toBeGreaterThan(0)
  expect(exercisedCells,'administrative TableView cells must be exercised').toBeGreaterThan(0)
})
