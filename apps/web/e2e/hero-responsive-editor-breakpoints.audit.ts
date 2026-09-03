import {expect,test} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'

test('full-page viewport controls the Hero image adjustment breakpoint',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  await page.goto(`${base}#/app/site/paginas/home/secoes/hero`,{waitUntil:'domcontentloaded'})

  const preview=page.locator('.home-hero-full-preview')
  const rail=page.locator('.home-hero-config-rail')

  await preview.getByRole('button',{name:'Tablet'}).click()
  await expect(rail.getByText('Tablet',{exact:true}).first()).toBeVisible()
  await expect(rail.getByText(/Ajustar enquadramento · Tablet/)).toBeVisible()
  await expect(rail.getByText(/Ajustes avançados · Tablet/)).toBeVisible()

  await preview.getByRole('button',{name:'Mobile'}).click()
  await expect(rail.getByText('Mobile',{exact:true}).first()).toBeVisible()
  await expect(rail.getByText(/Ajustar enquadramento · Mobile/)).toBeVisible()
  await expect(rail.getByText(/Ajustes avançados · Mobile/)).toBeVisible()
  await expect(rail.getByText(/Automático · herdado|Sobrescrito · Mobile/).first()).toBeVisible()
})
