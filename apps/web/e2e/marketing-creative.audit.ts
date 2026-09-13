import {Buffer} from 'node:buffer'
import {expect,test,type Locator,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const creationTypes=['Stories','Reels','Carrossel','Feed'] as const

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

async function assertViewportContainment(page:Page,modal:Locator,viewport:{width:number;height:number}){
 const bounds=await modal.boundingBox()
 expect(bounds).not.toBeNull()
 expect(bounds!.x).toBeGreaterThanOrEqual(6)
 expect(bounds!.y).toBeGreaterThanOrEqual(6)
 expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(viewport.width-6)
 expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(viewport.height-6)
 const documentWidth=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth))
 expect(documentWidth).toBeLessThanOrEqual(viewport.width+2)
 const footer=modal.locator('.marketing-content-dialog-footer')
 await expect(footer).toBeVisible()
 const footerBounds=await footer.boundingBox()
 expect(footerBounds).not.toBeNull()
 expect(footerBounds!.y+footerBounds!.height).toBeLessThanOrEqual(viewport.height)
}

test.describe('marketing content canonical format contract',()=>{
 test.use({viewport:{width:1920,height:1080}})

 test('offers only canonical creation types and updates every required transition immediately',async({page})=>{
  const pageErrors:string[]=[]
  const consoleErrors:string[]=[]
  page.on('pageerror',error=>pageErrors.push(error.message))
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())})
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  const select=typeSelect(modal)
  await expect(select.locator('option')).toHaveCount(4)
  expect(await select.locator('option').allTextContents()).toEqual([...creationTypes])
  await expect(select).toHaveValue('Feed')
  await selectType(modal,'Stories',9/16,':story:9x16')
  const stories=await canvasGeometry(modal)
  await selectType(modal,'Reels',9/16,':reel:9x16')
  const reels=await canvasGeometry(modal)
  expect(Math.abs(stories.width-reels.width)).toBeLessThanOrEqual(.5)
  expect(Math.abs(stories.height-reels.height)).toBeLessThanOrEqual(.5)
  await selectType(modal,'Carrossel',1,':carousel:1x1')
  await selectType(modal,'Feed',1,':feed:1x1')
  await selectType(modal,'Reels',9/16,':reel:9x16')
  await selectType(modal,'Feed',1,':feed:1x1')
  await selectType(modal,'Stories',9/16,':story:9x16')
  await selectType(modal,'Feed',1,':feed:1x1')
  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
 })

 test('preserves simple media while type changes reinterpret the same asset in the new canvas',async({page})=>{
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  const input=modal.locator('.marketing-media-drop input[type="file"]')
  await input.setInputFiles({name:'preview.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="black"/></svg>')})
  const preview=modal.getByAltText('Prévia da mídia')
  await expect(preview).toBeVisible()
  const originalSrc=await preview.getAttribute('src')
  expect(originalSrc).toMatch(/^blob:/)
  await selectType(modal,'Stories',9/16,':story:9x16')
  await expect(preview).toHaveAttribute('src',originalSrc!)
  await selectType(modal,'Reels',9/16,':reel:9x16')
  await expect(preview).toHaveAttribute('src',originalSrc!)
  await selectType(modal,'Carrossel',1,':carousel:1x1')
  await expect(preview).toHaveAttribute('src',originalSrc!)
  await selectType(modal,'Feed',1,':feed:1x1')
  await expect(preview).toHaveAttribute('src',originalSrc!)
 })

 test('keeps template inside supported canvases and falls back coherently for Carousel',async({page})=>{
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  const simpleButton=modal.getByRole('button',{name:'Mídia simples',exact:true})
  const templateButton=modal.getByRole('button',{name:'Template',exact:true})
  await templateButton.click()
  await expect(templateButton).toHaveClass(/active/)
  await expect(canvas(modal).locator('.marketing-creative-surface')).toBeVisible()
  await expect.poll(async()=>Math.abs((await canvasGeometry(modal)).ratio-1)).toBeLessThan(.01)
  const headline=modal.locator('.marketing-creative-control').filter({hasText:'Headline'}).locator('textarea').first()
  await headline.fill('Rascunho preservado entre formatos')
  await selectType(modal,'Stories',9/16,':story:9x16')
  await expect(canvas(modal).locator('.marketing-creative-surface')).toBeVisible()
  await selectType(modal,'Reels',9/16,':reel:9x16')
  await expect(canvas(modal).locator('.marketing-creative-surface')).toBeVisible()
  await selectType(modal,'Feed',1,':feed:1x1')
  await expect(canvas(modal).locator('.marketing-creative-surface')).toBeVisible()
  await selectType(modal,'Carrossel',1,':carousel:1x1')
  await expect(templateButton).toBeDisabled()
  await expect(templateButton).not.toHaveClass(/active/)
  await expect(simpleButton).toHaveClass(/active/)
  await expect(canvas(modal).locator('.marketing-creative-surface')).toHaveCount(0)
  await selectType(modal,'Feed',1,':feed:1x1')
  await expect(templateButton).toBeEnabled()
  await expect(simpleButton).toHaveClass(/active/)
  await templateButton.click()
  await expect(templateButton).toHaveClass(/active/)
  await expect(modal.locator('.marketing-creative-control').filter({hasText:'Headline'}).locator('textarea').first()).toHaveValue('Rascunho preservado entre formatos')
 })
})

for(const viewport of [
 {name:'desktop-xl',width:1920,height:1080,columns:true},
 {name:'desktop-1366',width:1366,height:768,columns:true},
 {name:'near-breakpoint',width:1000,height:800,columns:true},
 {name:'mobile',width:390,height:844,columns:false},
]){
 test.describe(`marketing creative ${viewport.width}x${viewport.height}`,()=>{
  test.use({viewport:{width:viewport.width,height:viewport.height}})

  test('keeps editor responsive, footer accessible and Full/Split geometry valid',async({page})=>{
   await openCalendar(page)
   const modal=await openCreativeModal(page)
   await assertViewportContainment(page,modal,viewport)
   const previewColumn=modal.locator('.marketing-content-reference-preview')
   const editorColumn=modal.locator('.marketing-content-dialog-form')
   const previewBounds=await previewColumn.boundingBox(),editorBounds=await editorColumn.boundingBox()
   expect(previewBounds).not.toBeNull();expect(editorBounds).not.toBeNull()
   if(viewport.columns){
    expect(editorBounds!.x).toBeGreaterThanOrEqual(previewBounds!.x+previewBounds!.width-1)
   }else{
    expect(editorBounds!.y).toBeGreaterThanOrEqual(previewBounds!.y+previewBounds!.height-1)
   }

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
   const geometry=await slots.evaluateAll(elements=>elements.map(element=>{
    const rect=element.getBoundingClientRect()
    const style=getComputedStyle(element.parentElement as HTMLElement)
    return {left:rect.left,right:rect.right,width:rect.width,gap:style.gap,columnGap:style.columnGap}
   }))
   expect(Math.abs(geometry[0].right-geometry[1].left)).toBeLessThanOrEqual(.5)
   expect(Math.abs(geometry[0].width-geometry[1].width)).toBeLessThanOrEqual(.5)
   expect(geometry[0].gap).toBe('0px')
   expect(geometry[0].columnGap).toBe('0px')

   if(viewport.columns&&viewport.height<=800){
    const gridScroll=await modal.locator('.marketing-content-dialog-grid').evaluate(element=>({clientHeight:element.clientHeight,scrollHeight:element.scrollHeight}))
    expect(gridScroll.scrollHeight).toBeLessThanOrEqual(gridScroll.clientHeight+1)
    const editorScroll=await editorColumn.evaluate(element=>({clientHeight:element.clientHeight,scrollHeight:element.scrollHeight}))
    expect(editorScroll.scrollHeight).toBeGreaterThan(editorScroll.clientHeight)
   }
   await assertViewportContainment(page,modal,viewport)
   await page.screenshot({path:`test-results/visual/marketing-creative-${viewport.name}-split.png`,fullPage:true})
  })
 })
}
