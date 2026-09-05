import {expect,test} from '@playwright/test'

const webBase=process.env.E2E_WEB_BASE_URL||'http://127.0.0.1:4173'
const apiBase=process.env.E2E_API_BASE_URL||'http://127.0.0.1:8787'
const title='E2E Editorial Candidate'

test('browser cura candidato real e converte somente em draft persistido',async({page})=>{
  const request=page.context().request
  const login=await request.post(`${apiBase}/api/auth/login`,{data:{email:'e2e-content-ingestion@example.com',password:'E2EContent!123'}})
  expect(login.ok()).toBeTruthy()
  await page.goto(`${webBase}/#/app/site/conteudos`)
  await expect(page.getByText(title,{exact:true})).toBeVisible()
  const row=()=>page.getByRole('row').filter({hasText:title})
  await row().getByRole('button',{name:'Revisar'}).click()
  await expect(row().getByText('reviewing',{exact:true})).toBeVisible()
  await row().getByRole('button',{name:'Aprovar'}).click()
  await expect(row().getByText('approved',{exact:true})).toBeVisible()
  await row().getByRole('button',{name:'Criar rascunho'}).click()
  await expect(row().getByText('converted',{exact:true})).toBeVisible()
  await expect(row().getByRole('link',{name:'Abrir rascunho'})).toBeVisible()

  const contents=await request.get(`${apiBase}/api/editorial/contents`)
  expect(contents.ok()).toBeTruthy()
  const payload=await contents.json() as {contents:Array<{title:string;status:string;active:boolean;publishedAt?:string}>}
  const draft=payload.contents.find(item=>item.title===title)
  expect(draft).toBeTruthy()
  expect(draft?.status).toBe('draft')
  expect(draft?.active).toBe(false)
  expect(draft?.publishedAt).toBeUndefined()
})
