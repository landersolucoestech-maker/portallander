import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const creationTypes=['Stories','Reels','Carrossel','Feed'] as const

async function openModal(page:Page,width=1440,height=900){
 await page.setViewportSize({width,height})
 await page.goto(`${base}#/app/marketing`,{waitUntil:'domcontentloaded'})
 await page.locator('#root').waitFor({state:'attached'})
 await page.getByRole('button',{name:'Novo Conteúdo',exact:true}).click()
 const dialog=page.locator('.marketing-content-dialog')
 await expect(dialog).toBeVisible()
 await expect(dialog.locator('#marketing-content-title')).toHaveText('Novo Conteúdo')
 return dialog
}

async function selectType(page:Page,type:typeof creationTypes[number]){
 await page.getByLabel('Tipo de conteúdo').selectOption(type)
 await expect(page.getByLabel('Tipo de conteúdo')).toHaveValue(type)
}

async function canvasGeometry(page:Page){
 return page.locator('.marketing-social-media').evaluate(node=>{
  const rect=node.getBoundingClientRect()
  return {
   width:rect.width,
   height:rect.height,
   ratio:rect.width/rect.height,
   format:node.getAttribute('data-format'),
  }
 })
}

async function assertNoHorizontalOverflow(page:Page){
 const measurements=await page.locator('.marketing-content-dialog').evaluate(node=>({clientWidth:node.clientWidth,scrollWidth:node.scrollWidth}))
 expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.clientWidth+1)
}

test('new content exposes only the four canonical creation types and updates canvas immediately',async({page})=>{
 await openModal(page)
 const select=page.getByLabel('Tipo de conteúdo')
 const options=await select.locator('option').allTextContents()
 expect(options).toEqual(creationTypes)

 const sequence=['Feed','Stories','Reels','Carrossel','Feed','Reels','Stories','Feed'] as const
 const expected={Feed:1,Stories:9/16,Reels:9/16,Carrossel:1} as const
 for(const type of sequence){
  await selectType(page,type)
  const geometry=await canvasGeometry(page)
  expect(geometry.ratio).toBeCloseTo(expected[type],2)
 }
})

test('Stories and Reels share the same rendered 9:16 canvas geometry',async({page})=>{
 await openModal(page)
 await selectType(page,'Stories')
 const stories=await canvasGeometry(page)
 await selectType(page,'Reels')
 const reels=await canvasGeometry(page)

 expect(stories.ratio).toBeCloseTo(9/16,3)
 expect(reels.ratio).toBeCloseTo(9/16,3)
 expect(reels.width).toBeCloseTo(stories.width,1)
 expect(reels.height).toBeCloseTo(stories.height,1)
 expect(stories.format).toContain('9x16')
 expect(reels.format).toContain('9x16')
})

test('simple preview media survives content type transitions',async({page})=>{
 await openModal(page)
 const input=page.locator('.marketing-media-drop input[type=file]')
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=','base64')
 await input.setInputFiles({name:'preview.png',mimeType:'image/png',buffer:png})
 await expect(page.locator('.marketing-social-media img')).toBeVisible()

 for(const type of ['Stories','Reels','Carrossel','Feed'] as const){
  await selectType(page,type)
  await expect(page.locator('.marketing-social-media img')).toBeVisible()
 }
})

test('template remains inside the content-type canvas and is not destructively reset',async({page})=>{
 await openModal(page)
 await page.getByRole('button',{name:'Template'}).click()
 await expect(page.getByRole('button',{name:'Template'})).toHaveClass(/active/)

 await selectType(page,'Stories')
 const stories=await canvasGeometry(page)
 await selectType(page,'Reels')
 const reels=await canvasGeometry(page)
 expect(stories.ratio).toBeCloseTo(9/16,3)
 expect(reels.ratio).toBeCloseTo(9/16,3)
 expect(reels.width).toBeCloseTo(stories.width,1)
 expect(reels.height).toBeCloseTo(stories.height,1)
 await expect(page.getByRole('button',{name:'Template'})).toHaveClass(/active/)

 await selectType(page,'Carrossel')
 expect((await canvasGeometry(page)).ratio).toBeCloseTo(1,3)
 await expect(page.getByRole('button',{name:'Template'})).toHaveClass(/active/)
 await expect(page.getByText(/Template foi preservado/)).toBeVisible()
})

for(const viewport of [
 {name:'wide',width:1440,height:900,columns:2},
 {name:'intermediate',width:1100,height:820,columns:2},
 {name:'breakpoint',width:1024,height:820,columns:1},
 {name:'mobile',width:390,height:844,columns:1},
] as const){
 test(`content editor stays usable without horizontal overflow at ${viewport.name}`,async({page})=>{
  const dialog=await openModal(page,viewport.width,viewport.height)
  const rect=await dialog.boundingBox()
  expect(rect).not.toBeNull()
  expect(rect!.x).toBeGreaterThanOrEqual(0)
  expect(rect!.x+rect!.width).toBeLessThanOrEqual(viewport.width+.5)
  expect(rect!.y).toBeGreaterThanOrEqual(0)
  expect(rect!.y+rect!.height).toBeLessThanOrEqual(viewport.height+.5)
  await assertNoHorizontalOverflow(page)

  const columns=await page.locator('.marketing-content-dialog-grid').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').filter(Boolean).length)
  expect(columns).toBe(viewport.columns)
  await expect(page.getByRole('button',{name:'Cancelar'})).toBeVisible()
  await expect(page.getByRole('button',{name:'Agendar Conteúdo'})).toBeVisible()
 })
}
