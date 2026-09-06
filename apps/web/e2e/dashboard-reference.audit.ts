import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const desktopViewports=[{width:1680,height:1050},{width:1440,height:900},{width:1280,height:800}]
const compactViewports=[{width:834,height:1112},{width:390,height:844}]

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

async function assertRejectedCompositionAbsent(page:Page){
 for(const heading of ['Hoje & Próximo','Funil Comercial','Alertas & Prioridades','Conteúdo & Publicações','Quick Actions'])await expect(page.getByRole('heading',{name:heading,exact:true})).toHaveCount(0)
 for(const rejectedId of ['dashboard-executive-summary','dashboard-operational-attention','dashboard-multichannel','dashboard-crm-summary','dashboard-content-activity','dashboard-agenda','dashboard-quick-actions'])await expect(page.getByTestId(rejectedId)).toHaveCount(0)
 await expect(page.locator('.dashboard-analytics-summary')).toHaveCount(0)
 await expect(page.getByText('Distribuição por canal',{exact:true})).toHaveCount(0)
}

test('dashboard follows the approved structural blueprint on desktop',async({page})=>{
 for(const viewport of desktopViewports){
  await page.setViewportSize(viewport)
  await openDashboard(page)

  const kpis=page.locator('[data-dashboard-kpi]')
  await expect(kpis).toHaveCount(5)
  for(const label of ['Novos Leads','Negociações','Faturamento (Mês)','Conteúdos Publicados','Visitas no Site'])await expect(page.getByTestId('dashboard-kpi-region').getByText(label,{exact:true})).toBeVisible()

  const analytics=page.getByTestId('dashboard-analytics-region')
  const activities=page.getByTestId('dashboard-recent-activity')
  const leads=page.getByTestId('dashboard-lead-distribution')
  const featured=page.getByTestId('dashboard-featured-content')
  const pending=page.getByTestId('dashboard-pending-attention')
  for(const region of [analytics,activities,leads,featured,pending])await expect(region).toBeVisible()

  const kpiBoxes=await kpis.evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}}))
  expect(spread(kpiBoxes.map(box=>box.y))).toBeLessThanOrEqual(4)
  expect(spread(kpiBoxes.map(box=>box.height))).toBeLessThanOrEqual(8)
  expect(relativeSpread(kpiBoxes.map(box=>box.width))).toBeLessThanOrEqual(.08)

  const row2=await page.locator('.dashboard-reference-row').boundingBox()
  const analyticsBox=await analytics.boundingBox()
  const activityBox=await activities.boundingBox()
  expect(row2).not.toBeNull();expect(analyticsBox).not.toBeNull();expect(activityBox).not.toBeNull()
  if(row2&&analyticsBox&&activityBox){
   expect(Math.abs(analyticsBox.y-activityBox.y)).toBeLessThanOrEqual(6)
   expect(Math.abs((analyticsBox.y+analyticsBox.height)-(activityBox.y+activityBox.height))).toBeLessThanOrEqual(10)
   expect(analyticsBox.x+analyticsBox.width).toBeLessThan(activityBox.x)
   const analyticsRatio=analyticsBox.width/row2.width
   const activityRatio=activityBox.width/row2.width
   expect(analyticsRatio).toBeGreaterThanOrEqual(.62)
   expect(analyticsRatio).toBeLessThanOrEqual(.70)
   expect(activityRatio).toBeGreaterThanOrEqual(.30)
   expect(activityRatio).toBeLessThanOrEqual(.38)
  }

  const bottomBoxes=await Promise.all([leads,featured,pending].map(locator=>locator.boundingBox()))
  const present=bottomBoxes.filter((box):box is NonNullable<typeof box>=>Boolean(box))
  expect(present).toHaveLength(3)
  expect(spread(present.map(box=>box.y))).toBeLessThanOrEqual(6)
  expect(relativeSpread(present.map(box=>box.width))).toBeLessThanOrEqual(.10)
  if(analyticsBox)for(const box of present)expect(box.y).toBeGreaterThan(analyticsBox.y+analyticsBox.height)

  await expect(page.getByTestId('dashboard-channel-tabs').getByRole('tab')).toHaveCount(4)
  for(const label of ['Website','Instagram','TikTok','YouTube'])await expect(page.getByTestId('dashboard-channel-tabs').getByRole('tab',{name:label,exact:true})).toBeVisible()
  await assertRejectedCompositionAbsent(page)
  await assertNoHorizontalOverflow(page)

  const screenshotName=viewport.width===1440?'dashboard-reference-final.png':`dashboard-reference-${viewport.width}x${viewport.height}.png`
  await page.screenshot({path:`test-results/visual/${screenshotName}`,fullPage:true})
 }
})

test('multichannel stays inside Performance without mini-dashboard overload',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await openDashboard(page)
 const analytics=page.getByTestId('dashboard-analytics-region')
 const tabs=analytics.getByTestId('dashboard-channel-tabs')
 await expect(analytics.getByTestId('dashboard-performance-context')).toBeVisible()
 await tabs.getByRole('tab',{name:'Instagram',exact:true}).click()
 await expect(analytics.getByTestId('dashboard-channel-detail-instagram')).toBeVisible()
 await tabs.getByRole('tab',{name:'TikTok',exact:true}).click()
 await expect(analytics.getByTestId('dashboard-channel-detail-tiktok')).toBeVisible()
 await tabs.getByRole('tab',{name:'YouTube',exact:true}).click()
 await expect(analytics.getByTestId('dashboard-channel-detail-youtube')).toBeVisible()
 await assertRejectedCompositionAbsent(page)
})

test('tablet and mobile preserve reference order without overflow',async({page})=>{
 for(const viewport of compactViewports){
  await page.setViewportSize(viewport)
  await openDashboard(page)
  const ids=['dashboard-kpi-region','dashboard-analytics-region','dashboard-recent-activity','dashboard-lead-distribution','dashboard-featured-content','dashboard-pending-attention']
  const positions=[]
  for(const id of ids){const box=await page.getByTestId(id).boundingBox();expect(box).not.toBeNull();positions.push(box?.y??0)}
  for(let index=1;index<positions.length;index++)expect(positions[index]).toBeGreaterThanOrEqual(positions[index-1]-2)
  await assertRejectedCompositionAbsent(page)
  await assertNoHorizontalOverflow(page)
  await page.screenshot({path:`test-results/visual/dashboard-reference-${viewport.width}x${viewport.height}.png`,fullPage:true})
 }
})
