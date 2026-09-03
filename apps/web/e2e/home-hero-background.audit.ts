import {expect,test,type BrowserContext,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const backgroundKey='portal-lander:home:hero:background:v1'
const configuredBackground={url:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221600%22 height=%22900%22%3E%3Crect width=%221600%22 height=%22900%22 fill=%22%23101010%22/%3E%3C/svg%3E',mediaId:'media-a',fileName:'hero-a.svg',positionX:31,positionY:64}

async function seedBackground(page:Page,value:typeof configuredBackground|null){
  await page.addInitScript(({key,value})=>{if(value)localStorage.setItem(key,JSON.stringify(value));else localStorage.removeItem(key)},{key:backgroundKey,value})
}
async function publicPage(context:BrowserContext){const page=await context.newPage();await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'});return page}

test.describe('Home Hero dynamic background',()=>{
  test('without configured image the Home does not fall back to a hardcoded background URL',async({page})=>{
    await seedBackground(page,null)
    await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    const background=page.locator('.editorial-hero-background')
    await expect(background).toBeVisible()
    expect(await background.evaluate(el=>getComputedStyle(el).backgroundImage)).toBe('none')
  })

  test('configured background and focal point render without changing Hero height',async({page})=>{
    await seedBackground(page,null);await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    const baseline=await page.locator('.editorial-hero').boundingBox()
    await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:backgroundKey,value:configuredBackground})
    await page.reload({waitUntil:'domcontentloaded'})
    const hero=page.locator('.editorial-hero'),background=page.locator('.editorial-hero-background')
    const configured=await hero.boundingBox()
    expect(configured?.height).toBe(baseline?.height)
    expect(await background.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('data:image/svg+xml')
    expect(await background.evaluate(el=>getComputedStyle(el).backgroundPosition)).toBe('31% 64%')
  })

  test('background draft updates the single admin preview without leaking into the public Home before save',async({page,context})=>{
    await seedBackground(page,configuredBackground)
    await page.goto(`${base}#/app/site/paginas/home/secoes/hero`,{waitUntil:'domcontentloaded'})
    const card=page.locator('.hero-background-card')
    const preview=page.locator('.hero-cms-preview-column')
    await expect(card.getByText('Configurada')).toBeVisible()
    await expect(preview).toHaveCount(1)
    await expect(page.locator('.hero-background-preview')).toHaveCount(0)
    await expect(preview.locator('.editorial-hero-background')).toHaveCSS('background-position','31% 64%')

    await card.getByRole('button',{name:/Remover imagem/}).click()
    await expect(card.getByText('Nenhuma imagem configurada')).toBeVisible()
    expect(await preview.locator('.editorial-hero-background').evaluate(el=>getComputedStyle(el).backgroundImage)).toBe('none')

    const beforeSave=await publicPage(context)
    expect(await beforeSave.locator('.editorial-hero-background').evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('data:image/svg+xml')
    await beforeSave.close()

    await card.getByRole('button',{name:/Salvar imagem/}).click()
    await expect(card.getByText(/Imagem de fundo salva/)).toBeVisible()
    const afterSave=await publicPage(context)
    expect(await afterSave.locator('.editorial-hero-background').evaluate(el=>getComputedStyle(el).backgroundImage)).toBe('none')
    await afterSave.close()
  })

  test('failed replacement keeps the previous valid image active',async({page})=>{
    await seedBackground(page,configuredBackground)
    await page.goto(`${base}#/app/site/paginas/home/secoes/hero`,{waitUntil:'domcontentloaded'})
    const card=page.locator('.hero-background-card')
    const input=card.locator('input[type="file"]')
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=','base64')
    await input.setInputFiles({name:'hero-b.png',mimeType:'image/png',buffer:png})
    await expect(card.getByRole('alert')).toContainText(/Biblioteca de mídia indisponível|não foi possível enviar/i)
    await expect(card.locator('.hero-background-media img')).toHaveAttribute('src',configuredBackground.url)
    const persisted=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{}'),backgroundKey)
    expect(persisted.url).toBe(configuredBackground.url)
  })

  test('Hero editor exposes exactly one responsive preview for Desktop Tablet and Mobile',async({page})=>{
    await seedBackground(page,configuredBackground)
    await page.goto(`${base}#/app/site/paginas/home/secoes/hero`,{waitUntil:'domcontentloaded'})
    const preview=page.locator('.hero-cms-preview-column')
    await expect(preview).toHaveCount(1)
    await expect(page.locator('.hero-background-preview')).toHaveCount(0)
    for(const name of ['Desktop','Tablet','Mobile']){
      await preview.getByRole('button',{name}).click()
      await expect(preview.locator('.editorial-hero')).toBeVisible()
      await expect(preview.locator('.editorial-hero-background')).toHaveCSS('background-position','31% 64%')
    }
  })
})
