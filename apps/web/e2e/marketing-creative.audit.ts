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
 await expect(modal.getByText('Template obrigatório',{exact:true})).toBeVisible()
 await expect(modal.locator('.marketing-news-surface')).toBeVisible()
 await expect(modal.getByRole('button',{name:'Mídia simples',exact:true})).toHaveCount(0)
 await expect(modal.getByRole('button',{name:'Template',exact:true})).toHaveCount(0)
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
  const footerElement=form.querySelector('.marketing-content-dialog-footer')
  return Boolean(grid&&footerElement&&grid.nextElementSibling===footerElement)
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
 for(const selector of ['.marketing-content-dialog{','.marketing-content-dialog>form{','.marketing-content-dialog-grid{','.marketing-content-reference-preview{','.marketing-content-dialog-form{','.marketing-content-dialog-footer{','.marketing-content-dialog-footer button{','.marketing-social-frame{'])expect(css).not.toContain(selector)
 expect(css).not.toContain('1560px')
 expect(css).not.toContain('920px')
 expect(css).not.toContain('520px')
 expect(css).not.toContain('390px')
})

test.describe('marketing content canonical format contract',()=>{
 test.use({viewport:{width:1920,height:1080}})

 test('keeps the Music OS compact shell while canonical content types control only canvas geometry',async({page})=>{
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
  await expect(modal.locator('.marketing-news-surface')).toBeVisible()
  const finalModal=await geometry(modal)
  expect(Math.abs(finalModal.width-initialModal.width)).toBeLessThanOrEqual(.5)
  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
 })

 test('platform identity does not change Feed geometry or the 760px shell',async({page})=>{
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
   const nextCanvas=await canvasGeometry(modal),nextModal=await geometry(modal),nextFrame=await geometry(socialFrame(modal))
   expect(Math.abs(nextCanvas.width-baselineCanvas.width)).toBeLessThanOrEqual(.5)
   expect(Math.abs(nextCanvas.height-baselineCanvas.height)).toBeLessThanOrEqual(.5)
   expect(Math.abs(nextModal.width-baselineModal.width)).toBeLessThanOrEqual(.5)
   expect(Math.abs(nextFrame.width-baselineFrame.width)).toBeLessThanOrEqual(.5)
  }
 })

 test('mandatory template is logo circle, company and handle, text, then media',async({page})=>{
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  const editor=modal.locator('.marketing-news-editor')
  await expect(editor).toBeVisible()
  await expect(editor.getByText('Identidade do perfil',{exact:true})).toBeVisible()
  await expect(editor.getByText('Texto visual',{exact:true})).toBeVisible()
  await expect(editor.getByText('Mídia',{exact:true})).toBeVisible()
  await expect(editor.getByText("Marca d'água",{exact:true})).toBeVisible()
  await expect(editor.getByText('Fonte',{exact:true})).toHaveCount(0)
  await expect(editor.getByText('Peso',{exact:true})).toHaveCount(0)
  await expect(editor.getByText('Alinhamento',{exact:true})).toHaveCount(0)

  const identityInputs=editor.locator('.marketing-news-identity-fields input')
  await identityInputs.nth(0).fill('Lander Editorial')
  await identityInputs.nth(1).fill('@landereditorial')
  const headline=editor.locator('.marketing-creative-control').filter({hasText:'Headline'}).locator('textarea').first()
  const body=editor.locator('.marketing-creative-control').filter({hasText:'Corpo'}).locator('textarea').first()
  await headline.fill('VIRAM ESSA?')
  await body.fill('Texto editorial logo abaixo da identidade, antes da mídia.')

  const surface=modal.locator('.marketing-news-surface')
  const header=surface.locator('[data-template-part="identity-copy"]')
  const profile=surface.locator('[data-template-part="profile"]')
  const copy=surface.locator('[data-template-part="copy"]')
  const media=surface.locator('[data-template-part="media"]')
  const avatar=surface.locator('.marketing-news-avatar')
  await expect(surface).toBeVisible()
  await expect(avatar.locator('img')).toBeVisible()
  await expect(avatar.locator('img')).toHaveAttribute('src',/^data:image\/svg\+xml/)
  await expect(surface.locator('.marketing-news-profile-text strong')).toHaveText('Lander Editorial')
  await expect(surface.locator('.marketing-news-profile-text span')).toHaveText('@landereditorial')
  await expect(surface.locator('.marketing-news-headline')).toHaveText('VIRAM ESSA?')
  await expect(surface.locator('.marketing-news-body')).toContainText('Texto editorial')
  expect(await surface.evaluate(element=>{
   const headerElement=element.querySelector('[data-template-part="identity-copy"]')
   const profileElement=element.querySelector('[data-template-part="profile"]')
   const copyElement=element.querySelector('[data-template-part="copy"]')
   const mediaElement=element.querySelector('[data-template-part="media"]')
   return Boolean(headerElement&&profileElement&&copyElement&&mediaElement&&headerElement.contains(profileElement)&&headerElement.contains(copyElement)&&headerElement.nextElementSibling===mediaElement&&(profileElement.compareDocumentPosition(copyElement)&Node.DOCUMENT_POSITION_FOLLOWING))
  })).toBe(true)
  const visual=await Promise.all([header,profile,copy,media,avatar].map(async locator=>{const rect=await geometry(locator);return rect}))
  expect(visual[1].y).toBeLessThan(visual[2].y)
  expect(visual[2].y).toBeLessThan(visual[3].y)
  expect(Math.abs(visual[4].width-visual[4].height)).toBeLessThanOrEqual(.5)
  await expect(avatar).toHaveCSS('border-radius','50%')
  await expect(header).toHaveCSS('background-color','rgb(255, 255, 255)')
  await expect(surface.locator('.marketing-news-profile-text strong')).toHaveCSS('color','rgb(17, 24, 39)')
  const squareHeaderRatio=visual[0].height/(await geometry(surface)).height
  expect(Math.abs(squareHeaderRatio-.42)).toBeLessThan(.02)
  await selectType(modal,'Stories',9/16,':story:9x16')
  const verticalSurface=modal.locator('.marketing-news-surface'),verticalHeader=verticalSurface.locator('.marketing-news-header')
  const verticalRatio=(await geometry(verticalHeader)).height/(await geometry(verticalSurface)).height
  expect(Math.abs(verticalRatio-.34)).toBeLessThan(.02)
 })

 test('Carousel is the explicit simple-media exception and restores the mandatory template draft on return',async({page})=>{
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  const headline=modal.locator('.marketing-creative-control').filter({hasText:'Headline'}).locator('textarea').first()
  await headline.fill('Rascunho obrigatório preservado')
  await selectType(modal,'Carrossel',1,':carousel:1x1')
  await expect(modal.locator('.marketing-news-surface')).toHaveCount(0)
  await expect(modal.getByText('Carrossel · mídia simples',{exact:true})).toBeVisible()
  const input=modal.locator('.marketing-media-drop input[type="file"]')
  await expect(input).toHaveAttribute('multiple','')
  await input.setInputFiles([
   {name:'carousel-a.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/>')},
   {name:'carousel-b.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/>')},
  ])
  await expect(modal.locator('.marketing-media-thumbs>div')).toHaveCount(2)
  await selectType(modal,'Feed',1,':feed:1x1')
  await expect(modal.locator('.marketing-news-surface')).toBeVisible()
  await expect(modal.locator('.marketing-creative-control').filter({hasText:'Headline'}).locator('textarea').first()).toHaveValue('Rascunho obrigatório preservado')
  await expect(modal.locator('.marketing-media-drop')).toHaveCount(0)
 })

 test('Full is one slot and Split is exact 50/50 with zero gap',async({page})=>{
  await openCalendar(page)
  const modal=await openCreativeModal(page)
  await expect(modal.locator('.marketing-creative-media-region.is-full .marketing-creative-media-slot')).toHaveCount(1)
  await modal.getByRole('button',{name:'Split',exact:true}).click()
  const region=modal.locator('.marketing-creative-media-region.is-split')
  const slots=region.locator('.marketing-creative-media-slot')
  await expect(slots).toHaveCount(2)
  const split=await slots.evaluateAll(elements=>elements.map(element=>{const rect=element.getBoundingClientRect();const parent=getComputedStyle(element.parentElement as HTMLElement);return {left:rect.left,right:rect.right,width:rect.width,gap:parent.gap,columnGap:parent.columnGap,border:getComputedStyle(element).borderWidth}}))
  expect(Math.abs(split[0].right-split[1].left)).toBeLessThanOrEqual(.5)
  expect(Math.abs(split[0].width-split[1].width)).toBeLessThanOrEqual(.5)
  expect(split[0].gap).toBe('0px')
  expect(split[0].columnGap).toBe('0px')
  expect(split[0].border).toBe('0px')
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
  test('keeps one central scroll region, visible preview and fixed footer',async({page})=>{
   await openCalendar(page)
   const modal=await openCreativeModal(page)
   await assertViewportContainment(page,modal,viewport)
   const previewColumn=modal.locator('.marketing-content-reference-preview'),editorColumn=modal.locator('.marketing-content-dialog-form'),modalBounds=await geometry(modal),previewBounds=await geometry(previewColumn),editorBounds=await geometry(editorColumn)
   const columns=await modal.locator('.marketing-content-dialog-grid').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length)
   expect(columns).toBe(viewport.columns?2:1)
   if(viewport.compact){expect(Math.abs(modalBounds.width-desktopModalWidth)).toBeLessThanOrEqual(1);expect(Math.abs(previewBounds.width-desktopPreviewWidth)).toBeLessThanOrEqual(1)}
   if(viewport.columns){expect(editorBounds.x).toBeGreaterThanOrEqual(previewBounds.x+previewBounds.width-1);await expect(previewColumn).toHaveCSS('position','sticky')}else{expect(editorBounds.y).toBeGreaterThanOrEqual(previewBounds.y+previewBounds.height-1);await expect(previewColumn).toHaveCSS('position','relative')}
   expect(await previewColumn.evaluate(element=>getComputedStyle(element).overflowY)).not.toBe('auto')
   expect(await editorColumn.evaluate(element=>getComputedStyle(element).overflowY)).not.toBe('auto')
   await modal.getByRole('button',{name:'Split',exact:true}).click()
   await modal.getByRole('button',{name:'Configurações avançadas'}).click()
   const grid=modal.locator('.marketing-content-dialog-grid')
   await grid.evaluate(element=>{element.scrollTop=element.scrollHeight})
   if(viewport.columns)await expect(previewColumn).toBeInViewport()
   const gridScroll=await grid.evaluate(element=>({clientHeight:element.clientHeight,scrollHeight:element.scrollHeight,overflowY:getComputedStyle(element).overflowY}))
   expect(gridScroll.overflowY).toBe('auto')
   expect(gridScroll.scrollHeight).toBeGreaterThanOrEqual(gridScroll.clientHeight)
   await assertViewportContainment(page,modal,viewport)
   await page.screenshot({path:`test-results/visual/marketing-creative-${viewport.name}-mandatory-template.png`,fullPage:true})
  })
 })
}
