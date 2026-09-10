import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const desktopViewports=[{width:1680,height:1050},{width:1440,height:900},{width:1280,height:800}]
const compactViewports=[{width:834,height:1112},{width:390,height:844}]
const expectedKpis=['Novos Leads','Negociações Ativas','Pipeline Comercial','A Receber','Faturamento do Mês']

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

test('dashboard reproduces the approved executive reference on desktop',async({page})=>{
 for(const viewport of desktopViewports){
  await page.setViewportSize(viewport)
  await openDashboard(page)

  const kpis=page.locator('[data-dashboard-kpi]')
  await expect(kpis).toHaveCount(5)
  expect(await renderedKpiLabels(page)).toEqual(expectedKpis)

  for(const heading of ['Performance Digital','Hoje & Próximos','Funil Comercial','Atividades Recentes','Conteúdo & Publicações']){
   await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible()
  }
  await expect(page.getByRole('heading',{name:'Alertas & Prioridades',exact:true})).toHaveCount(0)
  await expect(page.getByTestId('dashboard-pending-attention')).toHaveCount(0)

  const kpiBoxes=await kpis.evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}}))
  if(viewport.width>1280){
   expect(spread(kpiBoxes.map(box=>box.y))).toBeLessThanOrEqual(5)
   expect(spread(kpiBoxes.map(box=>box.height))).toBeLessThanOrEqual(8)
   expect(relativeSpread(kpiBoxes.map(box=>box.width))).toBeLessThanOrEqual(.08)
  }

  const performance=page.getByTestId('dashboard-analytics-region')
  const agenda=page.getByTestId('dashboard-today-next')
  const funnel=page.getByTestId('dashboard-lead-distribution')
  const activity=page.getByTestId('dashboard-recent-activity')
  const content=page.getByTestId('dashboard-featured-content')
  for(const region of [performance,agenda,funnel,activity,content])await expect(region).toBeVisible()

  if(viewport.width>1280){
   const performanceBox=await performance.boundingBox()
   const agendaBox=await agenda.boundingBox()
   const funnelBox=await funnel.boundingBox()
   const activityBox=await activity.boundingBox()
   const contentBox=await content.boundingBox()
   expect(performanceBox).not.toBeNull();expect(agendaBox).not.toBeNull();expect(funnelBox).not.toBeNull();expect(activityBox).not.toBeNull();expect(contentBox).not.toBeNull()
   if(performanceBox&&agendaBox){
    expect(Math.abs(performanceBox.y-agendaBox.y)).toBeLessThanOrEqual(6)
    expect(performanceBox.width).toBeGreaterThan(agendaBox.width*1.35)
   }
   if(funnelBox&&activityBox)expect(funnelBox.y).toBeLessThan(activityBox.y)
   if(activityBox&&contentBox){expect(Math.abs(activityBox.y-contentBox.y)).toBeLessThanOrEqual(6);expect(activityBox.x).toBeLessThan(contentBox.x)}
  }

  const tabs=page.getByTestId('dashboard-channel-tabs').getByRole('tab')
  await expect(tabs).toHaveCount(5)
  for(const label of ['Visão Geral','Instagram','YouTube','TikTok','Site'])await expect(page.getByTestId('dashboard-channel-tabs').getByRole('tab',{name:label,exact:true})).toBeVisible()
  await expect(page.getByText('Distribuição por canal',{exact:true})).toBeVisible()
  await assertNoHorizontalOverflow(page)

  const screenshotName=viewport.width===1440?'dashboard-reference-final.png':`dashboard-reference-${viewport.width}x${viewport.height}.png`
  await page.screenshot({path:`test-results/visual/${screenshotName}`,fullPage:true})
 }
})

test('performance channel tabs preserve the reference shell',async({page})=>{
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

test('tablet and mobile preserve reference order without overflow',async({page})=>{
 for(const viewport of compactViewports){
  await page.setViewportSize(viewport)
  await openDashboard(page)
  expect(await renderedKpiLabels(page)).toEqual(expectedKpis)
  await expect(page.getByRole('heading',{name:'Alertas & Prioridades',exact:true})).toHaveCount(0)
  await expect(page.getByTestId('dashboard-pending-attention')).toHaveCount(0)
  const ids=['dashboard-kpi-region','dashboard-analytics-region','dashboard-today-next','dashboard-lead-distribution','dashboard-recent-activity','dashboard-featured-content']
  const positions=[]
  for(const id of ids){const box=await page.getByTestId(id).boundingBox();expect(box).not.toBeNull();positions.push(box?.y??0)}
  for(let index=1;index<positions.length;index++)expect(positions[index]).toBeGreaterThanOrEqual(positions[index-1]-2)
  await assertNoHorizontalOverflow(page)
  await page.screenshot({path:`test-results/visual/dashboard-reference-${viewport.width}x${viewport.height}.png`,fullPage:true})
 }
})
