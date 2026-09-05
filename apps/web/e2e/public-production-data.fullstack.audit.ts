import {expect,test} from '@playwright/test'

const webBase=process.env.E2E_WEB_BASE_URL?.trim()
const apiBase=process.env.E2E_API_BASE_URL?.trim()
if(!webBase||!apiBase)throw new Error('Public production audit requires E2E_WEB_BASE_URL and E2E_API_BASE_URL.')
const title='E2E Public Production Headline'
const expectFailClosed=process.env.E2E_PUBLIC_EXPECT_FAIL_CLOSED==='1'

test('public production consumes persisted PostgreSQL snapshot or fails closed without mock fallback',async({page})=>{
  const mockRequests:string[]=[],snapshotResponses:number[]=[],pageErrors:string[]=[]
  page.on('request',request=>{if(/mockDataProvider|mockSeedLifecycle|\/mocks[-./]/i.test(request.url()))mockRequests.push(request.url())})
  page.on('response',response=>{if(response.url()===`${apiBase}/api/editorial/snapshot`)snapshotResponses.push(response.status())})
  page.on('pageerror',error=>pageErrors.push(error.message))

  await page.goto(`${webBase}/`)
  if(expectFailClosed){
    await expect(page.getByText('Dados operacionais indisponíveis.',{exact:true})).toBeVisible()
    await expect(page.getByText('A API pública ou o banco de dados não estão disponíveis para este ambiente.',{exact:true})).toBeVisible()
    await expect(page.getByText(title,{exact:true})).toHaveCount(0)
  }else{
    await expect(page.getByText(title,{exact:true}).first()).toBeVisible()
    await expect(page.getByText('Dados operacionais indisponíveis.',{exact:true})).toHaveCount(0)
    expect(snapshotResponses.some(status=>status===200)).toBe(true)
  }
  expect(mockRequests).toEqual([])
  expect(pageErrors).toEqual([])
})
