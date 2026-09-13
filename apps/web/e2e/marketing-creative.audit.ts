import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'

async function openCalendar(page:Page){
 await page.goto(`${base}#/app/marketing/calendar`,{waitUntil:'domcontentloaded'})
 await page.locator('#root').waitFor({state:'attached'})
 await expect.poll(()=>page.evaluate(()=>window.location.hash)).toBe('#/app/marketing/calendar')
 await expect(page.getByRole('button',{name:'Novo Conteúdo'}).first()).toBeVisible()
}

async function openCreativeModal(page:Page){
 await page.getByRole('button',{name:'Novo Conteúdo'}).first().click()
 const modal=page.locator('.marketing-content-dialog')
 await expect(modal).toBeVisible()
 await expect(modal.getByText('Criativo',{exact:true})).toBeVisible()
 await expect(modal.getByRole('button',{name:'Mídia simples',exact:true})).toHaveClass(/active/)
 return modal
}

for(const viewport of [{name:'desktop-xl',width:1920,height:1080},{name:'desktop-1366',width:1366,height:768}]){
 test.describe(`marketing creative ${viewport.width}x${viewport.height}`,()=>{
  test.use({viewport:{width:viewport.width,height:viewport.height}})

  test('keeps the existing modal usable and validates Full/Split geometry',async({page})=>{
   await openCalendar(page)
   const modal=await openCreativeModal(page)
   const bounds=await modal.boundingBox()
   expect(bounds).not.toBeNull()
   expect(bounds!.y).toBeGreaterThanOrEqual(8)
   expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(viewport.height-8)
   await expect(modal.locator('.marketing-content-dialog-footer')).toBeVisible()

   const title=modal.locator('.marketing-content-field').filter({hasText:'Título'}).locator('input').first()
   await title.fill('Título operacional inicial')
   await modal.getByRole('button',{name:'Template',exact:true}).click()
   await expect(modal.getByText(/News \/ Portal Lander/)).toBeVisible()
   await expect(modal.getByRole('button',{name:'Full',exact:true})).toHaveClass(/active/)
   await expect(modal.locator('.marketing-creative-surface')).toBeVisible()

   const headline=modal.locator('.marketing-creative-control').filter({hasText:'Headline'}).locator('textarea').first()
   await expect(headline).toHaveValue('Título operacional inicial')
   await headline.fill('Headline editorial independente')
   await title.fill('Título operacional alterado')
   await expect(headline).toHaveValue('Headline editorial independente')

   await modal.getByRole('button',{name:'Split',exact:true}).click()
   const mediaRegion=modal.locator('.marketing-creative-media-region.is-split')
   await expect(mediaRegion).toBeVisible()
   const slots=mediaRegion.locator('.marketing-creative-media-slot')
   await expect(slots).toHaveCount(2)
   const geometry=await slots.evaluateAll(elements=>elements.map(element=>{
    const rect=element.getBoundingClientRect()
    const style=getComputedStyle(element.parentElement as HTMLElement)
    return {left:rect.left,right:rect.right,width:rect.width,gap:style.gap,columnGap:style.columnGap}
   }))
   expect(Math.abs(geometry[0].right-geometry[1].left)).toBeLessThanOrEqual(.5)
   expect(Math.abs(geometry[0].width-geometry[1].width)).toBeLessThanOrEqual(.5)
   expect(geometry[0].gap).toBe('0px')
   expect(geometry[0].columnGap).toBe('0px')

   const documentWidth=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth))
   expect(documentWidth).toBeLessThanOrEqual(viewport.width+2)
   if(viewport.height===768){
    const scroll=await modal.locator('.marketing-content-dialog-grid').evaluate(element=>({clientHeight:element.clientHeight,scrollHeight:element.scrollHeight}))
    expect(scroll.scrollHeight).toBeGreaterThan(scroll.clientHeight)
    await expect(modal.locator('.marketing-content-dialog-footer')).toBeVisible()
   }
   await page.screenshot({path:`test-results/visual/marketing-creative-${viewport.name}-split.png`,fullPage:true})
  })
 })
}
