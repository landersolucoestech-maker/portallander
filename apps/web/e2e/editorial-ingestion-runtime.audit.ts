import {test,expect} from '@playwright/test'

const webBase=process.env.EDITORIAL_PROOF_WEB_URL||'http://127.0.0.1:4173'
const email=process.env.EDITORIAL_PROOF_ADMIN_EMAIL||''
const password=process.env.EDITORIAL_PROOF_ADMIN_PASSWORD||''
const candidateTitle='Prova full-stack — mercado musical brasileiro 2026'

test('browser → API → PostgreSQL: candidato aprovado vira somente draft',async({page})=>{
  expect(email).not.toBe('')
  expect(password).not.toBe('')
  await page.goto(`${webBase}/#/app/login`)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button',{name:'Entrar'}).click()
  await expect(page).toHaveURL(/#\/app\/dashboard/)

  await page.goto(`${webBase}/#/app/site/conteudos/importados`)
  await expect(page.getByRole('heading',{name:'Candidatos editoriais'})).toBeVisible()
  const row=page.getByRole('row').filter({hasText:candidateTitle})
  await expect(row).toBeVisible()
  await row.getByRole('button',{name:'Aprovar'}).click()

  await page.getByLabel('Estado').selectOption('approved')
  const approvedRow=page.getByRole('row').filter({hasText:candidateTitle})
  await expect(approvedRow).toBeVisible()
  const target=page.getByLabel('Página de destino')
  const options=target.locator('option')
  expect(await options.count()).toBeGreaterThan(1)
  const firstEditorialValue=await options.nth(1).getAttribute('value')
  expect(firstEditorialValue).toBeTruthy()
  await target.selectOption(firstEditorialValue!)
  await approvedRow.getByRole('button',{name:'Converter em draft'}).click()

  await expect(page).toHaveURL(/#\/app\/site\/conteudos\//)
  await expect(page.getByText(candidateTitle,{exact:true}).first()).toBeVisible()
})
