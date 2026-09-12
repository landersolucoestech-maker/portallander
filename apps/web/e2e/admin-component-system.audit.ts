import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const routes=[
  '/app/crm','/app/contracts','/app/finance','/app/agenda','/app/chat','/app/hr',
  '/app/metrics','/app/marketing','/app/reports','/app/settings','/app/site/pages',
  '/app/site/forms','/app/site/media-kit',
] as const

async function openRoute(page:Page,route:string){
  await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
  await page.locator('.app-shell .workspace-main').waitFor({state:'visible',timeout:15000})
  await page.evaluate(async()=>{try{if(document.fonts)await document.fonts.ready}catch{/* computed geometry remains measurable */}})
  await page.waitForTimeout(100)
}

test('canonical component system owns shared admin surface and control geometry',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  let surfaceCount=0
  let buttonCount=0

  for(const route of routes){
    await openRoute(page,route)
    const sample=await page.evaluate(()=>{
      const visible=(node:HTMLElement)=>{const rect=node.getBoundingClientRect(),style=getComputedStyle(node);return rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden'}
      const surfaceSelector=[
        '.admin-card','.crm-table-card','.finance-table-card','.contracts-table-card',
        '.agenda-calendar-card','.chat-card','.rh-table-card','.marketing-card',
        '.marketing-table-card','.metrics-card','.reports-entity-list','.settings-card',
        '.site-pages-management','.site-pages-structure','.site-pages-global-settings',
        '.section-editor-card','.section-editor-preview',
      ].join(',')
      const buttonSelector=[
        '.button','.crm-btn','.marketing-primary','.marketing-secondary',
        '.settings-primary','.settings-outline','.settings-danger','.rh-primary',
        '.rh-secondary','.reports-primary','.reports-outline','.site-pages-public-link',
        '.site-sections-configure',
      ].join(',')
      const surfaces=Array.from(document.querySelectorAll<HTMLElement>(surfaceSelector)).filter(visible).map(node=>({radius:getComputedStyle(node).borderRadius,shadow:getComputedStyle(node).boxShadow}))
      const buttons=Array.from(document.querySelectorAll<HTMLElement>(buttonSelector)).filter(visible).filter(node=>!node.closest('.workspace-top')).map(node=>({height:node.getBoundingClientRect().height,radius:getComputedStyle(node).borderRadius}))
      const tabs=Array.from(document.querySelectorAll<HTMLElement>('.crm-tabs,.finance-tabs,.contracts-tabs,.rh-tabs,.marketing-tabs,.settings-tabs,.chat-domain-tabs,.chat-settings-tabs,.marketing-platform-tabs-exact')).filter(visible).map(node=>getComputedStyle(node).overflowY)
      return {surfaces,buttons,tabs,scrollWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),viewport:innerWidth}
    })

    surfaceCount+=sample.surfaces.length
    buttonCount+=sample.buttons.length
    for(const surface of sample.surfaces){
      expect(surface.radius,`${route}: shared surface radius`).toBe('10px')
      expect(surface.shadow,`${route}: shared surface shadow`).toBe('none')
    }
    for(const button of sample.buttons){
      expect(button.height,`${route}: regular action height`).toBeGreaterThanOrEqual(35)
      expect(button.height,`${route}: regular action height`).toBeLessThanOrEqual(37)
      expect(button.radius,`${route}: regular action radius`).toBe('8px')
    }
    for(const overflowY of sample.tabs)expect(overflowY,`${route}: tabs must never expose a vertical scrollbar`).toBe('hidden')
    expect(sample.scrollWidth,`${route}: no document horizontal overflow`).toBeLessThanOrEqual(sample.viewport+2)
  }

  expect(surfaceCount,'shared surfaces must be exercised').toBeGreaterThan(12)
  expect(buttonCount,'shared actions must be exercised').toBeGreaterThan(8)
})

test('Pages configure action resolves to the canonical section editor route',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  await openRoute(page,'/app/site/pages')
  const configure=page.locator('.site-sections-actions .site-sections-configure').first()
  await expect(configure).toBeVisible()
  await configure.click()
  await expect(page.locator('.section-editor-workbench')).toBeVisible({timeout:15000})
  await expect(page.locator('.workspace-page-heading h1')).toContainText('Configurar seção:')
  await expect.poll(()=>page.url()).toMatch(/#\/app\/site\/pages\/[^/]+\/sections\/[^/]+$/)

  const back=page.locator('.workspace-header-back')
  await expect(back).toBeVisible()
  await back.click()
  await expect(page.locator('.site-pages-management')).toBeVisible({timeout:15000})
  await expect.poll(()=>page.url()).toContain('#/app/site/pages')
})

test('Pages inline dialogs are normalized by the canonical modal contract',async({page})=>{
  await page.setViewportSize({width:1440,height:900})
  await openRoute(page,'/app/site/pages')
  await page.getByRole('button',{name:/Criar página/i}).click()
  const dialog=page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  const geometry=await dialog.evaluate(node=>{
    const element=node as HTMLElement
    const style=getComputedStyle(element)
    const header=element.firstElementChild as HTMLElement|null
    const body=element.children.item(1) as HTMLElement|null
    const headerStyle=header?getComputedStyle(header):null
    const bodyStyle=body?getComputedStyle(body):null
    const rect=element.getBoundingClientRect()
    return {
      radius:style.borderRadius,
      shadow:style.boxShadow,
      width:rect.width,
      height:rect.height,
      headerPadding:headerStyle?`${headerStyle.paddingTop} ${headerStyle.paddingRight} ${headerStyle.paddingBottom} ${headerStyle.paddingLeft}`:'',
      bodyPadding:bodyStyle?`${bodyStyle.paddingTop} ${bodyStyle.paddingRight} ${bodyStyle.paddingBottom} ${bodyStyle.paddingLeft}`:'',
      titleSize:getComputedStyle(element.querySelector('h2') as HTMLElement).fontSize,
    }
  })

  expect(geometry.radius).toBe('10px')
  expect(geometry.shadow).not.toBe('none')
  expect(geometry.width).toBeLessThanOrEqual(560.5)
  expect(geometry.height).toBeLessThanOrEqual(868)
  expect(geometry.headerPadding).toBe('12px 16px 12px 16px')
  expect(geometry.bodyPadding).toBe('16px 16px 16px 16px')
  expect(geometry.titleSize).toBe('18px')

  await dialog.getByRole('button',{name:'Fechar'}).click()
  await expect(dialog).toHaveCount(0)
})
