import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const desktopViewports=[{width:1680,height:1050},{width:1440,height:900},{width:1280,height:800}]
const compactViewports=[{width:834,height:1112},{width:390,height:844}]
const expectedKpis=['Novos Leads','Negociações','Faturamento (mês)','Conteúdos Publicados','Visitas no Site (mês)']
const expectedSections=['Performance / Analytics','Atividades Recentes','Distribuição de Leads','Conteúdos em Destaque','Pendências & Atenção']
const rejectedSections=['Hoje & Próximos','Funil Comercial','Alertas & Prioridades','Conteúdo & Publicações']

async function openDashboard(page:Page){
 await page.goto(`${base}#/app/dashboard`,{waitUntil:'domcontentloaded'})
 await page.locator('[data-testid="dashboard-kpi-region"]').waitFor({state:'visible',timeout:15000})
 await page.waitForTimeout(120)
}

async function assertNoHorizontalOverflow(page:Page){
 const size=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)}))
 expect(size.scrollWidth).toBeLessThanOrEqual(size.viewport+2)
}

function spread(values:number[]){return Math.max(...values)-Math.min(...values)}
function relativeSpread(values:number[]){const average=values.reduce((sum,value)=>sum+value,0)/Math.max(1,values.length);return average===0?0:spread(values)/average}

async function renderedKpiLabels(page:Page){
 return page.locator('[data-dashboard-kpi] [data-dashboard-kpi-label]').evaluateAll(nodes=>nodes.map(node=>(node.textContent??'').replace(/\s+/g,' ').trim()))
}

async function assertApprovedComposition(page:Page){
 for(const heading of expectedSections)await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible()
 for(const heading of rejectedSections)await expect(page.getByRole('heading',{name:heading,exact:true})).toHaveCount(0)
 const kpis=page.getByTestId('dashboard-kpi-region')
 await expect(kpis.getByText('Pipeline Comercial',{exact:true})).toHaveCount(0)
 await expect(kpis.getByText('A Receber',{exact:true})).toHaveCount(0)
 await expect(page.getByTestId('dashboard-lead-distribution')).toBeVisible()
 await expect(page.getByTestId('dashboard-pending-attention')).toBeVisible()
}

test('dashboard reproduces the approved executive reference on desktop',async({page})=>{
 for(const viewport of desktopViewports){
  await page.setViewportSize(viewport)
  await openDashboard(page)

  const kpis=page.locator('[data-dashboard-kpi]')
  await expect(kpis).toHaveCount(5)
  expect(await renderedKpiLabels(page)).toEqual(expectedKpis)
  await assertApprovedComposition(page)

  const kpiBoxes=await kpis.evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}}))
  expect(spread(kpiBoxes.map(box=>box.y))).toBeLessThanOrEqual(5)
  expect(spread(kpiBoxes.map(box=>box.height))).toBeLessThanOrEqual(8)
  expect(relativeSpread(kpiBoxes.map(box=>box.width))).toBeLessThanOrEqual(.08)

  const performance=page.getByTestId('dashboard-analytics-region')
  const activity=page.getByTestId('dashboard-recent-activity')
  const leads=page.getByTestId('dashboard-lead-distribution')
  const content=page.getByTestId('dashboard-featured-content')
  const pending=page.getByTestId('dashboard-pending-attention')
  for(const region of [performance,activity,leads,content,pending])await expect(region).toBeVisible()

  const performanceBox=await performance.boundingBox()
  const activityBox=await activity.boundingBox()
  const leadsBox=await leads.boundingBox()
  const contentBox=await content.boundingBox()
  const pendingBox=await pending.boundingBox()
  expect(performanceBox).not.toBeNull();expect(activityBox).not.toBeNull();expect(leadsBox).not.toBeNull();expect(contentBox).not.toBeNull();expect(pendingBox).not.toBeNull()

  if(performanceBox&&activityBox){
   expect(Math.abs(performanceBox.y-activityBox.y)).toBeLessThanOrEqual(6)
   expect(performanceBox.width).toBeGreaterThan(activityBox.width*1.6)
   expect(performanceBox.width).toBeLessThan(activityBox.width*2.4)
  }
  if(leadsBox&&contentBox&&pendingBox){
   expect(spread([leadsBox.y,contentBox.y,pendingBox.y])).toBeLessThanOrEqual(6)
   expect(relativeSpread([leadsBox.width,contentBox.width,pendingBox.width])).toBeLessThanOrEqual(.1)
   expect(leadsBox.x).toBeLessThan(contentBox.x)
   expect(contentBox.x).toBeLessThan(pendingBox.x)
  }
  if(performanceBox&&leadsBox){expect(leadsBox.y).toBeGreaterThan(performanceBox.y+20)}

  const tabs=page.getByTestId('dashboard-channel-tabs').getByRole('tab')
  await expect(tabs).toHaveCount(5)
  for(const label of ['Visão Geral','Instagram','YouTube','TikTok','Site'])await expect(page.getByTestId('dashboard-channel-tabs').getByRole('tab',{name:label,exact:true})).toBeVisible()
  await expect(page.getByTestId('dashboard-channel-tabs').getByRole('tab',{name:'Visão Geral',exact:true})).toHaveAttribute('aria-selected','true')
  await expect(page.getByText('Resumo dos canais',{exact:true})).toBeVisible()
  await assertNoHorizontalOverflow(page)

  const screenshotName=viewport.width===1440?'dashboard-reference-final.png':`dashboard-reference-${viewport.width}x${viewport.height}.png`
  await page.screenshot({path:`test-results/visual/${screenshotName}`,fullPage:true})
 }
})

test('performance channel tabs preserve the approved analytics shell',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await openDashboard(page)
 const analytics=page.getByTestId('dashboard-analytics-region')
 const tabs=analytics.getByTestId('dashboard-channel-tabs')
 for(const label of ['Instagram','YouTube','TikTok','Site']){
  await tabs.getByRole('tab',{name:label,exact:true}).click()
  const key=label==='Instagram'?'instagram':label==='YouTube'?'youtube':label==='TikTok'?'tiktok':'site'
  await expect(analytics.getByTestId(`dashboard-channel-detail-${key}`)).toBeVisible()
 }
 await tabs.getByRole('tab',{name:'Visão Geral',exact:true}).click()
 await expect(analytics.getByTestId('dashboard-performance-summary')).toBeVisible()
})

test('tablet and mobile preserve approved reference order without overflow',async({page})=>{
 for(const viewport of compactViewports){
  await page.setViewportSize(viewport)
  await openDashboard(page)
  expect(await renderedKpiLabels(page)).toEqual(expectedKpis)
  await assertApprovedComposition(page)
  const ids=['dashboard-kpi-region','dashboard-analytics-region','dashboard-recent-activity','dashboard-lead-distribution','dashboard-featured-content','dashboard-pending-attention']
  const positions=[]
  for(const id of ids){const box=await page.getByTestId(id).boundingBox();expect(box).not.toBeNull();positions.push(box?.y??0)}
  for(let index=1;index<positions.length;index++)expect(positions[index]).toBeGreaterThanOrEqual(positions[index-1]-2)
  await assertNoHorizontalOverflow(page)
  await page.screenshot({path:`test-results/visual/dashboard-reference-${viewport.width}x${viewport.height}.png`,fullPage:true})
 }
})
