import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'

async function open(page:Page,route:string){
 await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
 await page.locator('#root').waitFor({state:'attached'})
 await page.waitForFunction(()=>document.querySelector('#root')?.childElementCount!==0)
}

test('production mock guard blocks operational fixtures but keeps Analytics truth-safe',async({page})=>{
 await open(page,'/app/marketing/campanhas')
 await expect(page.getByText('Dados de Marketing não conectados',{exact:true})).toBeVisible()
 await expect(page.getByRole('button',{name:/Nova Campanha/i})).toHaveCount(0)

 await open(page,'/app/marketing/metricas')
 await expect(page.getByText('Dados de Marketing não conectados',{exact:true})).toHaveCount(0)
 await expect(page.getByText('Analytics indisponível',{exact:true})).toBeVisible()
 await expect(page.getByText('INDISPONÍVEL',{exact:true}).first()).toBeVisible()
 await expect(page.locator('.marketing-content-ranking article')).toHaveCount(0)
 await expect(page.getByText(/UNAVAILABLE — não existe vínculo analítico/i)).toBeVisible()
})

test('deterministic Analytics response renders real zero, provenance and no unrelated ranking',async({page})=>{
 test.skip(process.env.ANALYTICS_RUNTIME_SIMULATION!=='1','Dedicated runtime simulation only')
 const currentMonth=new Date().toISOString().slice(0,7)
 const [year,month]=currentMonth.split('-').map(Number)
 const previousMonth=new Date(Date.UTC(year,month-2,1)).toISOString().slice(0,7)
 const metric=(id:string,metricKey:string,value:number,dataStatus='LIVE')=>({
   id,metricKey,value,unit:metricKey==='spend'?'BRL':'count',provider:'ga4',providerAccountId:'acct-sim',providerPropertyId:'prop-sim',
   scopeType:metricKey==='reach'?'content':'portal',scopeId:metricKey==='reach'?'unrelated-content':'portal',
   periodStart:'2026-09-01T03:00:00.000Z',periodEnd:'2026-10-01T03:00:00.000Z',granularity:'month',timezone:'America/Sao_Paulo',
   dimensions:{},filters:{},sourceType:'provider',sourceReference:`sim:${id}`,collectedAt:'2026-09-04T03:00:00.000Z',providerUpdatedAt:null,
   normalizedAt:'2026-09-04T03:01:00.000Z',freshnessStatus:'FRESH',dataStatus,syncId:'sync-sim',provenance:{providerMetric:metricKey},isEstimated:false,isManual:false,
 })
 let interceptedAnalyticsRequests=0
 await page.route('http://127.0.0.1:4173/api/analytics/metrics**',async route=>{
   interceptedAnalyticsRequests+=1
   const url=new URL(route.request().url())
   const start=url.searchParams.get('periodStart')||''
   const requestedMonth=start.slice(0,7)
   const isCurrent=requestedMonth===currentMonth
   const isPrevious=requestedMonth===previousMonth
   const metrics=isCurrent?[
     metric('imp-current','impressions',100),metric('click-current','clicks',25),metric('eng-current','engagement',10),metric('conv-current','conversions',0),metric('spend-current','spend',100),metric('followers-current','followers',500),metric('reach-unrelated','reach',999),metric('mock-ignored','impressions',999999,'MOCK'),
   ]:isPrevious?[
     metric('imp-previous','impressions',80),metric('click-previous','clicks',20),metric('eng-previous','engagement',5),metric('conv-previous','conversions',0),metric('spend-previous','spend',50),metric('followers-previous','followers',490),
   ]:[]
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({metrics})})
 })

 await open(page,'/app/marketing/metricas')
 await page.waitForTimeout(250)
 test.skip(interceptedAnalyticsRequests===0,'This production build has no Analytics API base; deterministic interception is proven by the dedicated Analytics browser runtime workflow.')
 await expect(page.getByText('Analytics indisponível',{exact:true})).toHaveCount(0)
 const impressionsCard=page.locator('.marketing-metric-strip article').filter({hasText:'Impressões'})
 await expect(impressionsCard.locator('strong')).toHaveText('100')
 await expect(impressionsCard).toContainText('+25.0%')
 const clicksCard=page.locator('.marketing-metric-strip article').filter({hasText:'Cliques'})
 await expect(clicksCard.locator('strong')).toHaveText('25')
 await expect(clicksCard).toContainText('+25.0%')
 await expect(clicksCard).toContainText('CTR 25.00%')
 const conversionsCard=page.locator('.marketing-metric-strip article').filter({hasText:'Conversões'})
 await expect(conversionsCard.locator('strong')).toHaveText('0')
 await expect(conversionsCard).toContainText('0.0%')
 await expect(page.getByText(/Atualizado em/).first()).toBeVisible()
 await expect(page.locator('.marketing-content-ranking article')).toHaveCount(0)
 await expect(page.getByText(/UNAVAILABLE — não existe vínculo analítico/i)).toBeVisible()
})
