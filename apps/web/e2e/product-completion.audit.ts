import {expect,test,type Locator,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'

async function openRoute(page:Page,route:string){
  await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
  await page.locator('#root').waitFor({state:'attached'})
  await page.waitForFunction(()=>document.querySelector('#root')?.childElementCount!==0)
}

async function assertNoHorizontalOverflow(page:Page){
  const dimensions=await page.evaluate(()=>({scroll:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),viewport:window.innerWidth}))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport+2)
}

async function cssVariable(locator:Locator,name:string){
  return locator.evaluate((node,property)=>getComputedStyle(node).getPropertyValue(property).trim(),name)
}

async function setColorInput(locator:Locator,value:string){
  await locator.evaluate((node,next)=>{
    const input=node as HTMLInputElement
    const nativeSetter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set
    if(!nativeSetter)throw new Error('Native HTMLInputElement value setter is unavailable.')
    nativeSetter.call(input,next)
    input.dispatchEvent(new Event('input',{bubbles:true}))
    input.dispatchEvent(new Event('change',{bubbles:true}))
  },value)
}

async function proveAppearance(page:Page,formId:string,screenshotName:string){
  await openRoute(page,`/app/site/formularios/${formId}`)
  const appearance=page.getByTestId('form-appearance-editor')
  const previewPanel=page.locator('.site-form-preview-panel')
  const preview=previewPanel.locator('.site-form-runtime')
  await expect(appearance).toBeVisible()
  await expect(previewPanel).toBeVisible()
  await expect(preview).toBeVisible()

  await appearance.getByRole('button',{name:'Destaque',exact:true}).click()
  await expect.poll(()=>cssVariable(preview,'--form-container-bg')).toBe('#111111')

  const layoutGroup=appearance.locator('details').filter({hasText:'Layout e container'})
  await layoutGroup.getByLabel('Largura relativa (%)',{exact:true}).fill('82')
  await expect.poll(()=>cssVariable(preview,'--form-container-width')).toBe('82%')
  await layoutGroup.getByLabel('Raio',{exact:true}).fill('24')
  await expect.poll(()=>cssVariable(preview,'--form-container-radius')).toBe('24px')
  const columns=appearance.getByRole('combobox',{name:'Colunas',exact:true})
  await expect(columns).toBeVisible()
  await columns.selectOption('1')
  await expect.poll(()=>cssVariable(preview,'--form-columns')).toBe('1')
  await columns.selectOption('2')
  await expect.poll(()=>cssVariable(preview,'--form-columns')).toBe('2')

  const buttonGroup=appearance.locator('details').filter({hasText:'Botão'})
  await buttonGroup.locator('summary').click()
  const buttonBackground=buttonGroup.getByLabel('Fundo',{exact:true})
  await setColorInput(buttonBackground,'#b80000')
  await expect.poll(()=>cssVariable(preview,'--form-button-bg')).toBe('#b80000')
  await buttonGroup.getByLabel('Raio',{exact:true}).fill('18')
  await expect.poll(()=>cssVariable(preview,'--form-button-radius')).toBe('18px')
  const buttonText=buttonGroup.getByLabel('Texto do botão',{exact:true})
  await buttonText.fill('Enviar agora')
  await expect(buttonText).toHaveValue('Enviar agora')
  await expect(preview.getByRole('button',{name:'ENVIAR AGORA',exact:true})).toBeVisible()

  await expect(page.getByText('Rascunho salvo',{exact:true})).toHaveCount(0)
  await page.screenshot({path:`test-results/product-completion/${screenshotName}`,fullPage:true})
  return {appearance,preview,previewPanel}
}

test.describe('Portal Lander product completion',()=>{
  test.use({viewport:{width:1440,height:900}})

  test('Marketing exposes Métricas in canonical order, navigates and never falls back to mock Analytics',async({page})=>{
    await openRoute(page,'/app/marketing')
    const marketingGroup=page.locator('.sidebar-nav-group').filter({has:page.getByRole('button',{name:/Marketing/i})})
    await expect(marketingGroup).toBeVisible()
    const labels=(await marketingGroup.locator('.sidebar-subnav-link').allInnerTexts()).map(value=>value.trim())
    expect(labels).toEqual(['Visão Geral','Campanhas','Calendário','Tarefas','Métricas','Briefings','IA Criativa'])
    const metricsLink=marketingGroup.getByRole('link',{name:'Métricas',exact:true})
    await metricsLink.click()
    await expect.poll(()=>page.evaluate(()=>window.location.hash)).toContain('/app/marketing/metricas')
    await expect(metricsLink).toHaveClass(/active/)
    await expect(page.getByLabel('Período das métricas')).toBeVisible()
    await expect(page.locator('.marketing-page')).not.toContainText('MOCK')
    const unavailable=page.getByText('Analytics indisponível',{exact:true})
    const metricStrip=page.locator('.marketing-metric-strip')
    await expect(metricStrip).toBeVisible()
    if(await unavailable.count())await expect(unavailable).toBeVisible()
    await assertNoHorizontalOverflow(page)
    await page.screenshot({path:'test-results/product-completion/marketing-metricas-1440.png',fullPage:true})
  })

  test('Lead capture exposes live visual customization through the shared public renderer',async({page})=>{
    await proveAppearance(page,'lead-capture','form-lead-capture-1440.png')
    const preview=page.locator('.site-form-preview-panel .site-form-runtime')
    await expect(preview).toHaveClass(/site-form-runtime-lead_capture/)
    await expect(preview.locator('input')).not.toHaveCount(0)
  })

  test('Colabore exposes textarea, select, upload, consent and CTA through the same live renderer',async({page})=>{
    await proveAppearance(page,'collaborate','form-colabore-1440.png')
    const preview=page.locator('.site-form-preview-panel .site-form-runtime')
    await expect(preview).toHaveClass(/site-form-runtime-editorial_submission/)
    await expect(preview.locator('textarea')).not.toHaveCount(0)
    await expect(preview.locator('.colabore-type-trigger')).not.toHaveCount(0)
    await expect(preview.locator('.colabore-upload')).not.toHaveCount(0)
    await expect(preview.locator('.colabore-consent')).not.toHaveCount(0)
    await expect(preview.locator('.colabore-submit')).toBeVisible()
  })

  test('System form browser fixture is honest about persistence while the live draft remains interactive',async({page})=>{
    await openRoute(page,'/app/site/formularios/lead-capture')
    const persistentNotice=page.getByText(/Editor persistente e versionado|Definição de runtime/)
    await expect(persistentNotice).toBeVisible()
    const save=page.getByRole('button',{name:'Salvar rascunho',exact:true})
    if(await page.getByText('Definição de runtime',{exact:true}).count())await expect(save).toBeDisabled()
    else await expect(save).toBeEnabled()
  })

  test('Mídia Kit editor keeps all nine shared pages mounted while showing only the selected page',async({page})=>{
    await openRoute(page,'/app/site/midia-kit')
    const live=page.getByTestId('media-kit-live-preview')
    await expect(live).toBeVisible()
    const document=live.locator('.mk-document')
    await expect(document).toBeVisible()
    await expect(live.locator('.mk-preview-page-frame')).toHaveCount(9)
    await expect(live.locator('[data-preview-page="1"]')).toBeVisible()
    await expect(live.locator('[data-preview-page="2"]')).toBeHidden()
    const title=page.getByLabel('Título do documento')
    const initial=await title.inputValue()
    await title.fill('MÍDIA KIT LIVE E2E')
    await expect(live.locator('[data-media-kit-page="1"] h1')).toContainText('MÍDIA KIT LIVE E2E')
    await expect(page.getByText('Rascunho salvo',{exact:true})).toHaveCount(0)
    await title.fill(initial)
    await live.getByLabel('Página do Mídia Kit').selectOption('2')
    await expect(document).toHaveAttribute('data-selected-page','2')
    await expect(live.locator('[data-preview-page="1"]')).toBeHidden()
    await expect(live.locator('[data-preview-page="2"]')).toBeVisible()
    const zoom=live.getByLabel('Zoom do preview')
    const before=await zoom.textContent()
    await live.getByRole('button',{name:'Aumentar zoom',exact:true}).click()
    await expect(zoom).not.toHaveText(before??'')
    await live.getByRole('button',{name:'Fit',exact:true}).click()
    await expect(live.getByRole('button',{name:'Abrir preview completo',exact:true})).toBeVisible()
    await expect(page.getByRole('button',{name:'Preview completo',exact:true})).toBeVisible()
    await page.screenshot({path:'test-results/product-completion/media-kit-live-preview-1440.png',fullPage:true})
  })

  test('Dashboard shows unavailable instead of invented Analytics and routes every visible action',async({page})=>{
    await openRoute(page,'/app/dashboard')
    const dashboard=page.locator('.unified-dashboard')
    await expect(dashboard).toBeVisible()
    await expect(page.getByRole('heading',{name:/Visitas no Site/i})).toBeVisible()
    await expect(dashboard).not.toContainText('26/Ago')
    await expect(dashboard).not.toContainText('01/Set')
    await expect(dashboard).not.toContainText('1700')
    await expect(page.getByText('MÉTRICA NÃO DISPONÍVEL',{exact:true})).toBeVisible()

    const routes:[string,RegExp][]=[
      ['Ver Métricas',/\/app\/marketing\/metricas$/],
      ['Ver todas',/\/app\/site\/conteudos$/],
      ['Ver agenda',/\/app\/agenda$/],
      ['Abrir CRM',/\/app\/crm$/],
    ]
    for(const [label,target] of routes){
      const action=page.getByRole('button',{name:label,exact:true}).first()
      await expect(action).toBeVisible()
      await action.click()
      await expect.poll(()=>page.evaluate(()=>window.location.hash)).toMatch(target)
      await openRoute(page,'/app/dashboard')
    }
    const taskAction=page.locator('.unified-task-progress').locator('..').getByRole('button',{name:'Ver todas',exact:true})
    await expect(taskAction).toBeVisible()
    await taskAction.click()
    await expect.poll(()=>page.evaluate(()=>window.location.hash)).toMatch(/\/app\/marketing\/tarefas$/)
    await openRoute(page,'/app/dashboard')
    await assertNoHorizontalOverflow(page)
    await page.screenshot({path:'test-results/product-completion/dashboard-1440.png',fullPage:true})
  })
})

test.describe('product completion mobile',()=>{
  test.use({viewport:{width:375,height:812}})

  test('Marketing Métricas remains usable at 375px',async({page})=>{
    await openRoute(page,'/app/marketing/metricas')
    await expect(page.getByLabel('Período das métricas')).toBeVisible()
    await assertNoHorizontalOverflow(page)
    await page.screenshot({path:'test-results/product-completion/mobile-marketing-metricas.png',fullPage:true})
  })

  for(const form of [{id:'lead-capture',name:'lead-capture'},{id:'collaborate',name:'colabore'}]){
    test(`${form.name} editor and preview remain usable at 375px`,async({page})=>{
      await openRoute(page,`/app/site/formularios/${form.id}`)
      await expect(page.getByTestId('form-appearance-editor')).toBeVisible()
      await expect(page.locator('.site-form-preview-panel .site-form-runtime')).toBeVisible()
      await assertNoHorizontalOverflow(page)
      await page.screenshot({path:`test-results/product-completion/mobile-form-${form.name}.png`,fullPage:true})
    })
  }

  test('Mídia Kit live preview remains scaled and navigable at 375px',async({page})=>{
    await openRoute(page,'/app/site/midia-kit')
    const live=page.getByTestId('media-kit-live-preview')
    await expect(live).toBeVisible()
    await live.getByLabel('Página do Mídia Kit').selectOption('9')
    await expect(live.locator('[data-preview-page="9"]')).toBeVisible()
    await assertNoHorizontalOverflow(page)
    await page.screenshot({path:'test-results/product-completion/mobile-media-kit.png',fullPage:true})
  })

  test('Dashboard unavailable Analytics and cards remain usable at 375px',async({page})=>{
    await openRoute(page,'/app/dashboard')
    await expect(page.locator('.unified-dashboard')).toBeVisible()
    await expect(page.getByText('MÉTRICA NÃO DISPONÍVEL',{exact:true})).toBeVisible()
    await assertNoHorizontalOverflow(page)
    await page.screenshot({path:'test-results/product-completion/mobile-dashboard.png',fullPage:true})
  })
})
