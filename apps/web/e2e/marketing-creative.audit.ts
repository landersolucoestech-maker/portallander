import {Buffer} from 'node:buffer'
import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {expect,test,type Locator,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const creationTypes=['Stories','Reels','Carrossel','Feed'] as const
const desktopModalWidth=760
const desktopPreviewWidth=300

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

function typeSelect(modal:Locator){return modal.locator('.marketing-content-field').filter({hasText:'Tipo de conteúdo'}).locator('select').first()}
function canvas(modal:Locator){return modal.locator('.marketing-social-media')}
function socialFrame(modal:Locator){return modal.locator('.marketing-social-frame')}

async function geometry(locator:Locator){
 const rect=await locator.boundingBox()
 expect(rect).not.toBeNull()
 return rect!
}

async function canvasGeometry(modal:Locator){
 return canvas(modal).evaluate(element=>{
  const rect=element.getBoundingClientRect()
  return {width:rect.width,height:rect.height,ratio:rect.width/rect.height,format:element.getAttribute('data-format')}
 })
}

async function selectType(modal:Locator,type:typeof creationTypes[number],expectedRatio:number,formatSuffix:string){
 await typeSelect(modal).selectOption(type)
 await expect(canvas(modal)).toHaveAttribute('data-format',new RegExp(`${formatSuffix}$`))
 await expect.poll(async()=>Math.abs((await canvasGeometry(modal)).ratio-expectedRatio)).toBeLessThan(.01)
}

async function assertDesktopShell(modal:Locator){
 const modalBounds=await geometry(modal)
 const previewBounds=await geometry(modal.locator('.marketing-content-reference-preview'))
 expect(Math.abs(modalBounds.width-desktopModalWidth)).toBeLessThanOrEqual(1)
 expect(Math.abs(previewBounds.width-desktopPreviewWidth)).toBeLessThanOrEqual(1)
 expect(await modal.locator('.marketing-content-dialog-grid').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length)).toBe(2)
}

async function assertViewportContainment(page:Page,modal:Locator,viewport:{width:number;height:number}){
 const bounds=await geometry(modal)
 expect(bounds.x).toBeGreaterThanOrEqual(6)
 expect(bounds.y).toBeGreaterThanOrEqual(6)
 expect(bounds.x+bounds.width).toBeLessThanOrEqual(viewport.width-6)
 expect(bounds.y+bounds.height).toBeLessThanOrEqual(viewport.height-6)
 const documentWidth=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth))
 expect(documentWidth).toBeLessThanOrEqual(viewport.width+2)
 const footer=modal.locator('.marketing-content-dialog-footer')
 await expect(footer).toBeVisible()
 const footerBounds=await geometry(footer)
 expect(footerBounds.y+footerBounds.height).toBeLessThanOrEqual(viewport.height)
 expect(await modal.locator('form').evaluate(form=>{
  const grid=form.querySelector('.marketing-content-dialog-grid')
  const footer=form.querySelector('.marketing-content-dialog-footer')
  return Boolean(grid&&footer&&grid.nextElementSibling===footer)
 })).toBe(true)
}

async function setPrimaryPlatform(modal:Locator,target:Locator){
 if(await target.getAttribute('aria-pressed')!=='true')await target.click()
 if(await target.locator('small').count()===0){
  const currentPrimary=modal.locator('.marketing-platform-pills button').filter({hasText:'principal'}).first()
  await expect(currentPrimary).toBeVisible()
  await currentPrimary.click()
 }
 await expect(target.locator('small')).toHaveText('principal')
}

test('creative stylesheet does not own the content modal shell',async()=>{
 const css=await readFile(resolve(process.cwd(),'src/modules/marketing/creative/creative-editor.css'),'utf8')
 for(const selector of ['.marketing-content-dialog{','.marketing-content-dialog>form{','.marketing-content-dialog-grid{','.marketing-content-reference-preview{','.marketing-content-dialog-form{','.marketing-content-dialog-footer{','.marketing-content-dialog-footer button{','.marketing-social-frame{']){
  expect(css).not.toContain(selector)
 }
 expect(css).not.toContain('1560px')
 expect(css).not.toContain('920px')
 expect(css).not.toContain('520px')
 expect(css).not.toContain('390px')
})

test.describe('marketing content canonical format contract',()=>{
 test.use({viewport:{width:1920,height:1080}})

 test('uses the Music OS compact shell and updates every canonical type without resizing the frame',async({page})=>{
  const pageErrors:string[]=[]
  const consoleErrors:string[]=[]
  page.on('pageerror',error=>pageErrors.push(error.message))
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())})
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  await assertDesktopShell(modal)
  const select=typeSelect(modal)
  await expect(select.locator('option')).toHaveCount(4)
  expect(await select.locator('option').allTextContents()).toEqual([...creationTypes])
  await expect(select).toHaveValue('Feed')
  const initialModal=await geometry(modal),initialFrame=await geometry(socialFrame(modal))

  await selectType(modal,'Stories',9/16,':story:9x16')
  const stories=await canvasGeometry(modal),storiesFrame=await geometry(socialFrame(modal))
  await selectType(modal,'Reels',9/16,':reel:9x16')
  const reels=await canvasGeometry(modal),reelsFrame=await geometry(socialFrame(modal))
  expect(Math.abs(stories.width-reels.width)).toBeLessThanOrEqual(.5)
  expect(Math.abs(stories.height-reels.height)).toBeLessThanOrEqual(.5)
  expect(Math.abs(storiesFrame.width-reelsFrame.width)).toBeLessThanOrEqual(.5)
  expect(Math.abs(storiesFrame.width-initialFrame.width)).toBeLessThanOrEqual(.5)
  await selectType(modal,'Carrossel',1,':carousel:1x1')
  expect(Math.abs((await geometry(socialFrame(modal))).width-initialFrame.width)).toBeLessThanOrEqual(.5)
  await selectType(modal,'Feed',1,':feed:1x1')
  await selectType(modal,'Reels',9/16,':reel:9x16')
  await selectType(modal,'Feed',1,':feed:1x1')
  await selectType(modal,'Stories',9/16,':story:9x16')
  await selectType(modal,'Feed',1,':feed:1x1')
  const finalModal=await geometry(modal)
  expect(Math.abs(finalModal.width-initialModal.width)).toBeLessThanOrEqual(.5)
  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
 })

 test('platform chrome changes do not change Feed geometry or the 760px shell',async({page})=>{
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  await assertDesktopShell(modal)
  await selectType(modal,'Feed',1,':feed:1x1')
  const baselineCanvas=await canvasGeometry(modal),baselineModal=await geometry(modal),baselineFrame=await geometry(socialFrame(modal))
  const platforms=modal.locator('.marketing-platform-pills button')
  const limit=Math.min(await platforms.count(),4)
  expect(limit).toBeGreaterThanOrEqual(2)
  for(let index=1;index<limit;index+=1){
   const target=platforms.nth(index)
   await setPrimaryPlatform(modal,target)
   await expect.poll(async()=>Math.abs((await canvasGeometry(modal)).ratio-1)).toBeLessThan(.01)
   const nextCanvas=await canvasGeometry(modal),nextModal=await geometry(modal),nextFrame=await geometry(socialFrame(modal))
   expect(Math.abs(nextCanvas.width-baselineCanvas.width)).toBeLessThanOrEqual(.5)
   expect(Math.abs(nextCanvas.height-baselineCanvas.height)).toBeLessThanOrEqual(.5)
   expect(Math.abs(nextModal.width-baselineModal.width)).toBeLessThanOrEqual(.5)
   expect(Math.abs(nextFrame.width-baselineFrame.width)).toBeLessThanOrEqual(.5)
  }
 })

 test('simple media preserves assets across type changes and only Carousel exposes multiple upload',async({page})=>{
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  const input=modal.locator('.marketing-media-drop input[type="file"]')
  await expect(input).not.toHaveAttribute('multiple','')
  await input.setInputFiles({name:'preview.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="black"/></svg>')})
  const preview=modal.getByAltText('Prévia da mídia')
  await expect(preview).toBeVisible()
  const originalSrc=await preview.getAttribute('src')
  expect(originalSrc).toMatch(/^blob:/)
  await selectType(modal,'Stories',9/16,':story:9x16')
  await expect(input).not.toHaveAttribute('multiple','')
  await expect(preview).toHaveAttribute('src',originalSrc!)
  await selectType(modal,'Reels',9/16,':reel:9x16')
  await expect(preview).toHaveAttribute('src',originalSrc!)
  await selectType(modal,'Carrossel',1,':carousel:1x1')
  await expect(input).toHaveAttribute('multiple','')
  await input.setInputFiles([
   {name:'carousel-a.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/>')},
   {name:'carousel-b.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/>')},
  ])
  await expect(modal.locator('.marketing-media-thumbs>div')).toHaveCount(3)
  await selectType(modal,'Feed',1,':feed:1x1')
  await expect(input).not.toHaveAttribute('multiple','')
  await expect(modal.locator('.marketing-media-thumbs>div')).toHaveCount(1)
  await selectType(modal,'Carrossel',1,':carousel:1x1')
  await expect(modal.locator('.marketing-media-thumbs>div')).toHaveCount(3)
  await modal.getByRole('button',{name:'Remover mídia da prévia'}).first().click()
  await expect(modal.locator('.marketing-media-thumbs>div')).toHaveCount(2)
 })

 test('preserves template draft but keeps Carousel renderer unavailable',async({page})=>{
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  const simpleButton=modal.getByRole('button',{name:'Mídia simples',exact:true})
  const templateButton=modal.getByRole('button',{name:'Template',exact:true})
  await templateButton.click()
  await expect(templateButton).toHaveClass(/active/)
  await expect(canvas(modal).locator('.marketing-creative-surface')).toBeVisible()
  const headline=modal.locator('.marketing-creative-control').filter({hasText:'Headline'}).locator('textarea').first()
  await headline.fill('Rascunho preservado entre formatos')
  await selectType(modal,'Stories',9/16,':story:9x16')
  await selectType(modal,'Reels',9/16,':reel:9x16')
  await selectType(modal,'Feed',1,':feed:1x1')
  await selectType(modal,'Carrossel',1,':carousel:1x1')
  await expect(templateButton).toBeEnabled()
  await expect(templateButton).toHaveClass(/active/)
  await expect(simpleButton).not.toHaveClass(/active/)
  await expect(modal.getByText(/Template foi preservado/)).toBeVisible()
  await expect(modal.getByRole('button',{name:'Gerar arte final'})).toHaveCount(0)
  await simpleButton.click()
  await expect(simpleButton).toHaveClass(/active/)
  await expect(templateButton).toBeDisabled()
  await selectType(modal,'Feed',1,':feed:1x1')
  await expect(templateButton).toBeEnabled()
  await templateButton.click()
  await expect(modal.locator('.marketing-creative-control').filter({hasText:'Headline'}).locator('textarea').first()).toHaveValue('Rascunho preservado entre formatos')
 })
})

for(const viewport of [
 {name:'desktop-xl',width:1920,height:1080,columns:true,compact:true},
 {name:'desktop-1366',width:1366,height:768,columns:true,compact:true},
 {name:'near-breakpoint',width:901,height:800,columns:true,compact:true},
 {name:'tablet',width:900,height:800,columns:false,compact:false},
 {name:'mobile',width:390,height:844,columns:false,compact:false},
]){
 test.describe(`marketing creative ${viewport.width}x${viewport.height}`,()=>{
  test.use({viewport:{width:viewport.width,height:viewport.height}})

  test('keeps the compact shell, one central scroll region, accessible footer and Full/Split geometry',async({page})=>{
   await openCalendar(page)
   const modal=await openCreativeModal(page)
   await assertViewportContainment(page,modal,viewport)
   const previewColumn=modal.locator('.marketing-content-reference-preview')
   const editorColumn=modal.locator('.marketing-content-dialog-form')
   const previewBounds=await geometry(previewColumn),editorBounds=await geometry(editorColumn),modalBounds=await geometry(modal)
   const columns=await modal.locator('.marketing-content-dialog-grid').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length)
   expect(columns).toBe(viewport.columns?2:1)
   if(viewport.compact){
    expect(Math.abs(modalBounds.width-desktopModalWidth)).toBeLessThanOrEqual(1)
    expect(Math.abs(previewBounds.width-desktopPreviewWidth)).toBeLessThanOrEqual(1)
   }
   if(viewport.columns){
    expect(editorBounds.x).toBeGreaterThanOrEqual(previewBounds.x+previewBounds.width-1)
   }else{
    expect(editorBounds.y).toBeGreaterThanOrEqual(previewBounds.y+previewBounds.height-1)
   }
   expect(await previewColumn.evaluate(element=>getComputedStyle(element).overflowY)).not.toBe('auto')
   expect(await editorColumn.evaluate(element=>getComputedStyle(element).overflowY)).not.toBe('auto')

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

   await selectType(modal,'Reels',9/16,':reel:9x16')
   await modal.getByRole('button',{name:'Split',exact:true}).click()
   const mediaRegion=modal.locator('.marketing-creative-media-region.is-split')
   await expect(mediaRegion).toBeVisible()
   const slots=mediaRegion.locator('.marketing-creative-media-slot')
   await expect(slots).toHaveCount(2)
   const splitGeometry=await slots.evaluateAll(elements=>elements.map(element=>{
    const rect=element.getBoundingClientRect()
    const style=getComputedStyle(element.parentElement as HTMLElement)
    return {left:rect.left,right:rect.right,width:rect.width,gap:style.gap,columnGap:style.columnGap}
   }))
   expect(Math.abs(splitGeometry[0].right-splitGeometry[1].left)).toBeLessThanOrEqual(.5)
   expect(Math.abs(splitGeometry[0].width-splitGeometry[1].width)).toBeLessThanOrEqual(.5)
   expect(splitGeometry[0].gap).toBe('0px')
   expect(splitGeometry[0].columnGap).toBe('0px')

   await modal.getByRole('button',{name:'Configurações avançadas'}).click()
   await expect(modal.locator('.marketing-advanced-panel')).toBeVisible()
   const gridScroll=await modal.locator('.marketing-content-dialog-grid').evaluate(element=>({clientHeight:element.clientHeight,scrollHeight:element.scrollHeight,overflowY:getComputedStyle(element).overflowY}))
   expect(gridScroll.overflowY).toBe('auto')
   expect(gridScroll.scrollHeight).toBeGreaterThanOrEqual(gridScroll.clientHeight)
   await assertViewportContainment(page,modal,viewport)
   await page.screenshot({path:`test-results/visual/marketing-creative-${viewport.name}-split.png`,fullPage:true})
  })
 })
}
