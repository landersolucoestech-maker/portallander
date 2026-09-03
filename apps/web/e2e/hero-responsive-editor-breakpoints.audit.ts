import {expect,test} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'

test('full-page viewport controls the Hero image adjustment breakpoint',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  await page.goto(`${base}#/app/site/paginas/home/secoes/hero`,{waitUntil:'domcontentloaded'})

  const preview=page.locator('.home-hero-full-preview')
  const sourceHero=page.locator('.home-hero-config-rail .hero-cms-preview-stage .editorial-hero')

  await preview.getByRole('button',{name:'Tablet'}).click()
  await expect(preview.locator('.home-hero-full-preview-canvas')).toHaveAttribute('data-preview-viewport','tablet')
  await expect(preview.locator('iframe')).toHaveCSS('width','768px')
  await expect(sourceHero).toHaveAttribute('data-hero-breakpoint','tablet')

  await preview.getByRole('button',{name:'Mobile'}).click()
  await expect(preview.locator('.home-hero-full-preview-canvas')).toHaveAttribute('data-preview-viewport','mobile')
  await expect(preview.locator('iframe')).toHaveCSS('width','390px')
  await expect(sourceHero).toHaveAttribute('data-hero-breakpoint','mobile')
})

test('unsaved Hero draft is mirrored live into the full-page iframe',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  await page.goto(`${base}#/app/site/paginas/home/secoes/hero`,{waitUntil:'domcontentloaded'})

  const preview=page.locator('.home-hero-full-preview')
  await preview.getByRole('button',{name:'Mobile'}).click()

  const iframe=preview.locator('iframe')
  await expect(iframe).toBeVisible()
  const frame=page.frames().find(item=>item.url().includes('#/_preview/home'))
  expect(frame).toBeTruthy()
  await expect(frame!.locator('.editorial-hero')).toBeVisible()

  await page.locator('.home-hero-config-rail .hero-cms-preview-stage .editorial-hero').evaluate(element=>{
    element.setAttribute('data-live-e2e','unsaved-responsive-draft')
  })

  await expect(frame!.locator('.editorial-hero')).toHaveAttribute('data-live-e2e','unsaved-responsive-draft')
})
