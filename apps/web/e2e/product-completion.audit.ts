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

  test('Métricas stays top-level, preserves legacy routing and never falls back to mock Analytics',async({page})=>{
    await openRoute(page,'/app/marketing')
    const nav=page.getByRole('navigation',{name:'Módulos da Administração'})
    const marketingGroup=nav.locator('.sidebar-nav-group').filter({has:page.getByRole('button',{name:/Marketing/i})})
    await expect(marketingGroup).toBeVisible()
    const labels=(await marketingGroup.locator('.sidebar-subnav-link').allInnerTexts()).map(value=>value.trim())
    expect(labels).toEqual(['Visão Geral','Campanhas','Calendário','Tarefas','Briefings','IA Criativa'])
    const metricsLink=nav.getByRole('link',{name:'Métricas',exact:true})
    await expect(metricsLink).toBeVisible()
    await expect(metricsLink).toHaveAttribute('href','#/app/metricas')
    await metricsLink.click()
    await expect.poll(()=>page.evaluate(()=>window.location.hash)).toBe('#/app/metricas')
    await expect(metricsLink).toHaveClass(/active/)
    await expect(page.getByLabel('Período global das métricas')).toHaveCount(0)
    await expect(page.locator('.metrics-page .marketing-metrics-period')).toHaveCount(0)
    const tabs=page.getByRole('tablist',{name:'Fontes de Métricas'}).getByRole('tab')
    await expect(tabs).toHaveCount(5)
    expect((await tabs.allInnerTexts()).map(value=>value.trim())).toEqual(['Visão Geral','Site','Instagram','TikTok','YouTube'])
    await expect(page.getByTestId('metrics-overview-tab')).toBeVisible()
    await expect(page.locator('.metrics-page')).not.toContainText('MOCK')
    await openRoute(page,'/app/marketing/metricas?tab=instagram')
    await expect.poll(()=>page.evaluate(()=>window.location.hash)).toBe('#/app/metricas?tab=instagram')
    await expect(page.getByRole('tab',{name:'Instagram',exact:true})).toHaveAttribute('aria-selected','true')
    await assertNoHorizontalOverflow(page)
    await page.screenshot({path:'test-results/product-completion/metricas-global-1440.png',fullPage:true})
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

  test('Dashboard presents the executive hierarchy, multichannel pulse and only useful actions',async({page})=>{
    await openRoute(page,'/app/dashboard')
    const dashboard=page.locator('.unified-dashboard')
    await expect(dashboard).toBeVisible()
    await expect(page.getByRole('heading',{name:'Resumo executivo',exact:true})).toBeVisible()
    await expect(page.getByRole('heading',{name:'Atenção operacional',exact:true})).toBeVisible()
    await expect(page.getByRole('heading',{name:'Performance multicanal',exact:true})).toBeVisible()
    await expect(page.getByTestId('dashboard-crm-summary')).toBeVisible()
    await expect(page.getByTestId('dashboard-content-activity')).toBeVisible()
    await expect(page.getByTestId('dashboard-agenda')).toBeVisible()
    await expect(page.getByTestId('dashboard-quick-actions')).toBeVisible()
    await expect(dashboard).not.toContainText('Tarefas Pendentes')
    await expect(dashboard).not.toContainText('Conteúdos em Destaque')
    await expect(dashboard).not.toContainText('Visitas no Site')

    const multichannel=page.getByTestId('dashboard-multichannel')
    for(const channel of ['Website','Instagram','TikTok','YouTube'])await expect(multichannel.getByText(channel,{exact:true})).toBeVisible()
    await expect(multichannel).not.toContainText('MOCK')

    const channelRoutes:[string,RegExp][]=[
      ['Abrir Métricas de Website',/\/app\/metricas\?tab=site$/],
      ['Abrir Métricas de Instagram',/\/app\/metricas\?tab=instagram$/],
      ['Abrir Métricas de TikTok',/\/app\/metricas\?tab=tiktok$/],
      ['Abrir Métricas de YouTube',/\/app\/metricas\?tab=youtube$/],
    ]
    for(const [label,target] of channelRoutes){
      const action=page.getByRole('link',{name:label,exact:true})
      await expect(action).toBeVisible()
      await action.click()
      await expect.poll(()=>page.evaluate(()=>window.location.hash)).toMatch(target)
      await openRoute(page,'/app/dashboard')
    }

    const quickActions:[string,RegExp][]=[
      ['Métricas',/\/app\/metricas$/],
      ['CRM',/\/app\/crm$/],
      ['Financeiro',/\/app\/finance$/],
      ['Conteúdos',/\/app\/site\/conteudos$/],
      ['Agenda',/\/app\/agenda$/],
    ]
    const quick=page.getByRole('navigation',{name:'Ações rápidas do Dashboard'})
    for(const [label,target] of quickActions){
      const action=quick.getByRole('link',{name:label,exact:true})
      await expect(action).toBeVisible()
      await action.click()
      await expect.poll(()=>page.evaluate(()=>window.location.hash)).toMatch(target)
      await openRoute(page,'/app/dashboard')
    }
    await assertNoHorizontalOverflow(page)
    await page.screenshot({path:'test-results/product-completion/dashboard-executive.png',fullPage:true})
  })
})

test.describe('product completion mobile',()=>{
  test.use({viewport:{width:375,height:812}})

  test('Global Métricas remains usable at 375px',async({page})=>{
    await openRoute(page,'/app/metricas')
    await expect(page.getByLabel('Período global das métricas')).toHaveCount(0)
    await expect(page.locator('.metrics-page .marketing-metrics-period')).toHaveCount(0)
    await expect(page.getByRole('tablist',{name:'Fontes de Métricas'}).getByRole('tab')).toHaveCount(5)
    await assertNoHorizontalOverflow(page)
    await page.screenshot({path:'test-results/product-completion/mobile-metricas-global.png',fullPage:true})
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

  test('Dashboard preserves executive-first hierarchy and multichannel usability at 375px',async({page})=>{
    await openRoute(page,'/app/dashboard')
    const dashboard=page.locator('.unified-dashboard')
    await expect(page.getByTestId('dashboard-executive-summary')).toBeVisible()
    await expect(page.getByTestId('dashboard-operational-attention')).toBeVisible()
    await expect(page.getByTestId('dashboard-multichannel')).toBeVisible()
    const order=await page.evaluate(()=>{
      const executive=document.querySelector('[data-testid="dashboard-executive-summary"]')?.getBoundingClientRect().top??Infinity
      const multichannel=document.querySelector('[data-testid="dashboard-multichannel"]')?.getBoundingClientRect().top??Infinity
      const content=document.querySelector('[data-testid="dashboard-content-activity"]')?.getBoundingClientRect().top??Infinity
      return {executive,multichannel,content}
    })
    expect(order.executive).toBeLessThan(order.multichannel)
    expect(order.multichannel).toBeLessThan(order.content)
    await expect(dashboard).not.toContainText('Tarefas Pendentes')
    await assertNoHorizontalOverflow(page)
    await page.screenshot({path:'test-results/product-completion/mobile-dashboard-executive.png',fullPage:true})
  })
})
