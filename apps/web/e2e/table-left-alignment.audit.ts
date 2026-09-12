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

test('administrative TableViews left-align data and center selector checkboxes',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  let exercisedTables=0
  let exercisedDataCells=0
  let exercisedSelectors=0

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
        cells:cells.map(node=>{
          const checkbox=node.querySelector<HTMLInputElement>('input[type="checkbox"]')
          const isSelector=Boolean(checkbox)||node.matches('.crm-checkbox-cell,.select,.contracts-checkbox-cell,.check')
          let checkboxCenterDelta:number|null=null
          if(checkbox&&visible(checkbox)){
            const cellRect=node.getBoundingClientRect()
            const checkboxRect=checkbox.getBoundingClientRect()
            checkboxCenterDelta=Math.abs((cellRect.left+cellRect.width/2)-(checkboxRect.left+checkboxRect.width/2))
          }
          return {tag:node.tagName,className:node.className,textAlign:getComputedStyle(node).textAlign,isSelector,checkboxCenterDelta}
        }),
        sortHeaders:sortHeaders.map(node=>getComputedStyle(node).justifyContent),
        rowActions:rowActions.map(node=>getComputedStyle(node).justifyContent),
      }
    })

    exercisedTables+=sample.tables
    for(const cell of sample.cells){
      if(cell.isSelector){
        exercisedSelectors++
        expect(cell.textAlign,`${route} ${cell.tag}.${cell.className}: selector rail axis`).toBe('center')
        if(cell.checkboxCenterDelta!==null)expect(cell.checkboxCenterDelta,`${route} ${cell.tag}.${cell.className}: checkbox geometric centering`).toBeLessThanOrEqual(1.5)
      }else{
        exercisedDataCells++
        expect(cell.textAlign,`${route} ${cell.tag}.${cell.className}: data column axis`).toBe('left')
      }
    }
    for(const alignment of sample.sortHeaders)expect(alignment,`${route}: sortable header axis`).toBe('flex-start')
    for(const alignment of sample.rowActions)expect(alignment,`${route}: row actions axis`).toBe('flex-start')
  }

  expect(exercisedTables,'administrative TableViews must be exercised').toBeGreaterThan(0)
  expect(exercisedDataCells,'administrative data cells must be exercised').toBeGreaterThan(0)
  expect(exercisedSelectors,'administrative selector rails must be exercised').toBeGreaterThan(0)
})
