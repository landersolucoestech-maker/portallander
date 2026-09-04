import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'

async function openRoute(page:Page,route:string){
  await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
  await page.locator('#root').waitFor({state:'attached'})
  await page.waitForFunction(()=>document.querySelector('#root')?.childElementCount!==0)
  await page.waitForTimeout(120)
}

async function assertNoHorizontalOverflow(page:Page){
  const dimensions=await page.evaluate(()=>({scroll:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),viewport:window.innerWidth}))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport+2)
}

test.describe('Portal Lander product completion',()=>{
  test.use({viewport:{width:1440,height:900}})

  test('Marketing exposes Métricas as a selectable canonical submodule',async({page})=>{
    await openRoute(page,'/app/marketing/metricas')
    const metricsLink=page.locator('.sidebar-subnav-link.active').filter({hasText:'Métricas'})
    await expect(metricsLink).toBeVisible()
    await expect(metricsLink).toHaveAttribute('href',/\/app\/marketing\/metricas$/)
    await expect(page.getByLabel('Período das métricas')).toBeVisible()
    await page.screenshot({path:'test-results/product-completion/marketing-metricas-1440.png',fullPage:true})
  })

  for(const form of [
    {id:'lead-capture',name:'lead-capture'},
    {id:'collaborate',name:'colabore'},
  ]){
    test(`${form.name} exposes safe appearance controls and updates the shared renderer before save`,async({page})=>{
      await openRoute(page,`/app/site/formularios/${form.id}`)
      const appearance=page.getByTestId('form-appearance-editor')
      const preview=page.locator('.site-form-preview-panel .site-form-runtime')
      await expect(appearance).toBeVisible()
      await expect(preview).toBeVisible()
      await appearance.getByRole('button',{name:'Destaque'}).click()
      await expect(preview).toHaveCSS('background-color','rgb(17, 17, 17)')
      await appearance.getByText('Botão',{exact:true}).click()
      const buttonText=appearance.getByText('Texto do botão',{exact:true}).locator('..').locator('input')
      await buttonText.fill('Enviar agora')
      await expect(preview.getByRole('button',{name:/Enviar agora/i})).toBeVisible()
      await page.screenshot({path:`test-results/product-completion/form-${form.name}-1440.png`,fullPage:true})
    })
  }

  test('Mídia Kit editor renders current draft through the shared nine-page document',async({page})=>{
    await openRoute(page,'/app/site/midia-kit')
    const live=page.getByTestId('media-kit-live-preview')
    await expect(live).toBeVisible()
    await expect(live.locator('.mk-document')).toBeVisible()
    await expect(live.locator('.mk-preview-page-frame')).toHaveCount(9)
    const title=page.getByText('Título do documento',{exact:true}).locator('..').locator('input')
    await title.fill('MÍDIA KIT LIVE E2E')
    await expect(live.locator('h1')).toContainText('MÍDIA KIT LIVE E2E')
    await live.getByLabel('Página do Mídia Kit').selectOption('2')
    await expect(live.locator('.mk-document')).toHaveAttribute('data-selected-page','2')
    await expect(live.locator('[data-preview-page="2"]')).toBeVisible()
    await expect(live.getByRole('button',{name:/Abrir preview completo/i})).toBeVisible()
    await page.screenshot({path:'test-results/product-completion/media-kit-live-preview-1440.png',fullPage:true})
  })

  test('Dashboard never renders the retired hardcoded visits series and routes its actions',async({page})=>{
    await openRoute(page,'/app/dashboard')
    await expect(page.getByRole('heading',{name:/Visitas no Site/i})).toBeVisible()
    await expect(page.locator('.unified-dashboard')).not.toContainText('26/Ago')
    await expect(page.locator('.unified-dashboard')).not.toContainText('01/Set')
    const metricAction=page.getByRole('button',{name:/Ver Métricas|Abrir Métricas/i}).first()
    await expect(metricAction).toBeVisible()
    await metricAction.click()
    await expect.poll(()=>page.evaluate(()=>window.location.hash)).toContain('/app/marketing/metricas')
    await openRoute(page,'/app/dashboard')
    await page.screenshot({path:'test-results/product-completion/dashboard-1440.png',fullPage:true})
  })
})

test.describe('product completion mobile',()=>{
  test.use({viewport:{width:375,height:812}})

  for(const route of ['/app/site/formularios/lead-capture','/app/site/formularios/collaborate','/app/site/midia-kit','/app/dashboard']){
    test(`${route} remains usable at 375px`,async({page})=>{
      await openRoute(page,route)
      await assertNoHorizontalOverflow(page)
      if(route.includes('/formularios/')){
        await expect(page.getByTestId('form-appearance-editor')).toBeVisible()
        await expect(page.locator('.site-form-preview-panel .site-form-runtime')).toBeVisible()
      }
      if(route.endsWith('/midia-kit'))await expect(page.getByTestId('media-kit-live-preview')).toBeVisible()
      if(route.endsWith('/dashboard'))await expect(page.locator('.unified-dashboard')).toBeVisible()
      await page.screenshot({path:`test-results/product-completion/mobile-${route.replaceAll('/','-').replace(/^-/, '')}.png`,fullPage:true})
    })
  }
})
