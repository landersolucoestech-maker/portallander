import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'

async function openDashboard(page:Page){
 await page.goto(`${base}#/app/dashboard`,{waitUntil:'domcontentloaded'})
 await page.locator('[data-testid="dashboard-kpi-region"]').waitFor({state:'visible',timeout:15000})
 await page.waitForTimeout(120)
}

async function assertNoHorizontalOverflow(page:Page){
 const size=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)}))
 expect(size.scrollWidth).toBeLessThanOrEqual(size.viewport+2)
}

test('dashboard follows the approved structural blueprint on desktop',async({page})=>{
 for(const viewport of [{width:1680,height:1050},{width:1440,height:900},{width:1280,height:800}]){
  await page.setViewportSize(viewport)
  await openDashboard(page)
  await expect(page.locator('[data-dashboard-kpi]')).toHaveCount(5)
  await expect(page.getByTestId('dashboard-analytics-region')).toBeVisible()
  await expect(page.getByTestId('dashboard-recent-activity')).toBeVisible()
  await expect(page.getByTestId('dashboard-lead-distribution')).toBeVisible()
  await expect(page.getByTestId('dashboard-featured-content')).toBeVisible()
  await expect(page.getByTestId('dashboard-pending-attention')).toBeVisible()
  await expect(page.getByTestId('dashboard-channel-tabs').getByRole('tab')).toHaveCount(4)
  for(const label of ['Website','Instagram','TikTok','YouTube'])await expect(page.getByTestId('dashboard-channel-tabs').getByRole('tab',{name:label,exact:true})).toBeVisible()

  const kpiBoxes=await page.locator('[data-dashboard-kpi]').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}}))
  expect(Math.max(...kpiBoxes.map(box=>box.y))-Math.min(...kpiBoxes.map(box=>box.y))).toBeLessThanOrEqual(2)

  const analyticsBox=await page.getByTestId('dashboard-analytics-region').boundingBox()
  const activityBox=await page.getByTestId('dashboard-recent-activity').boundingBox()
  expect(analyticsBox).not.toBeNull();expect(activityBox).not.toBeNull()
  if(analyticsBox&&activityBox){
   expect(Math.abs(analyticsBox.y-activityBox.y)).toBeLessThanOrEqual(2)
   expect(analyticsBox.width).toBeGreaterThan(activityBox.width*1.45)
  }

  const bottomBoxes=await Promise.all(['dashboard-lead-distribution','dashboard-featured-content','dashboard-pending-attention'].map(id=>page.getByTestId(id).boundingBox()))
  const bottomY=bottomBoxes.filter((box):box is NonNullable<typeof box>=>Boolean(box)).map(box=>box.y)
  expect(bottomY).toHaveLength(3)
  expect(Math.max(...bottomY)-Math.min(...bottomY)).toBeLessThanOrEqual(2)
  await assertNoHorizontalOverflow(page)
 }
})

test('multichannel stays inside the large analytics panel and rejected standalone composition is absent',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await openDashboard(page)
 const analytics=page.getByTestId('dashboard-analytics-region')
 const tabs=analytics.getByTestId('dashboard-channel-tabs')
 await tabs.getByRole('tab',{name:'Instagram',exact:true}).click()
 await expect(analytics.getByTestId('dashboard-channel-detail-instagram')).toBeVisible()
 await tabs.getByRole('tab',{name:'YouTube',exact:true}).click()
 await expect(analytics.getByTestId('dashboard-channel-detail-youtube')).toBeVisible()
 await expect(page.locator('[data-testid="dashboard-executive-summary"]')).toHaveCount(0)
 await expect(page.locator('[data-testid="dashboard-operational-attention"]')).toHaveCount(0)
 await expect(page.locator('[data-testid="dashboard-multichannel"]')).toHaveCount(0)
 await expect(page.locator('[data-testid="dashboard-quick-actions"]')).toHaveCount(0)
})

test('tablet and mobile preserve reference order without overflow',async({page})=>{
 for(const viewport of [{width:834,height:1112},{width:390,height:844}]){
  await page.setViewportSize(viewport)
  await openDashboard(page)
  const ids=['dashboard-kpi-region','dashboard-analytics-region','dashboard-recent-activity','dashboard-lead-distribution','dashboard-featured-content','dashboard-pending-attention']
  const positions=[]
  for(const id of ids){const box=await page.getByTestId(id).boundingBox();expect(box).not.toBeNull();positions.push(box?.y??0)}
  for(let index=1;index<positions.length;index++)expect(positions[index]).toBeGreaterThanOrEqual(positions[index-1]-2)
  await assertNoHorizontalOverflow(page)
 }
})
