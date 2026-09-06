import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'

async function openRoute(page:Page,route:string){
  await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
  await page.locator('#root').waitFor({state:'attached'})
  await page.waitForFunction(()=>document.querySelector('#root')?.childElementCount!==0)
}

async function expectCanonicalAdminRows(page:Page){
  const rows=page.locator('.site-forms-table tbody tr')
  await expect(rows).toHaveCount(2)
  await expect(rows.nth(0)).toContainText(/Contato Comercial|Colabore \/ Anuncie/)
  await expect(rows.nth(1)).toContainText(/Contato Comercial|Colabore \/ Anuncie/)
  await expect(page.getByText('Contato Comercial',{exact:true})).toBeVisible()
  await expect(page.getByText('Colabore / Anuncie',{exact:true})).toBeVisible()
  await expect(page.getByText('Captação de Leads',{exact:true})).toHaveCount(0)
  await expect(page.getByText('Contato Comercial · Anuncie',{exact:true})).toHaveCount(0)
  await expect(rows.filter({hasText:'Contato Comercial'})).toContainText('CRM → Leads')
  await expect(rows.filter({hasText:'Colabore / Anuncie'})).toContainText('Site → Conteúdos → Colaborações recebidas')
}

async function schemaSignature(page:Page){
  return page.locator('.site-form-runtime').evaluate(node=>Array.from(node.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[name]')).map(input=>input.name).filter(name=>name!=='_portal_hp').sort())
}

test.describe('canonical system forms',()=>{
  test.use({viewport:{width:1440,height:900}})

  test('admin data source remains exactly two across refresh and renavigation',async({page})=>{
    await openRoute(page,'/app/site/formularios')
    await expectCanonicalAdminRows(page)

    await page.reload({waitUntil:'domcontentloaded'})
    await page.waitForFunction(()=>document.querySelector('#root')?.childElementCount!==0)
    await expectCanonicalAdminRows(page)

    await openRoute(page,'/app/dashboard')
    await expect(page.locator('.unified-dashboard')).toBeVisible()
    await openRoute(page,'/app/site/formularios')
    await expectCanonicalAdminRows(page)

    const systemRows=page.locator('.site-forms-table tbody tr')
    for(let index=0;index<2;index+=1){
      await systemRows.nth(index).getByRole('button',{name:/Ações de/}).click()
      await expect(page.getByRole('menuitem',{name:'Duplicar',exact:true})).toHaveCount(0)
      await page.keyboard.press('Escape')
    }
  })

  test('public Contato renders the canonical CRM form instead of mailto intake',async({page})=>{
    await openRoute(page,'/contato')
    const form=page.locator('.site-form-runtime-lead_capture')
    await expect(form).toBeVisible()
    await expect(form).toContainText('Como podemos ajudar?')
    await expect(page.locator('.pl-contact-form-region')).toContainText('CRM → Leads')
    await expect(page.locator('.pl-contact-form')).toHaveCount(0)
  })

  test('Colabore and Anuncie render the same canonical schema and never a separate advertising form',async({page})=>{
    await openRoute(page,'/colabore')
    const colaboreForm=page.locator('.site-form-runtime-editorial_submission')
    await expect(colaboreForm).toBeVisible()
    const colaboreSchema=await schemaSignature(page)

    await openRoute(page,'/anuncie')
    const anuncieForm=page.locator('.site-form-runtime-editorial_submission')
    await expect(anuncieForm).toBeVisible()
    const anuncieSchema=await schemaSignature(page)

    expect(anuncieSchema).toEqual(colaboreSchema)
    await expect(anuncieForm).toContainText('Tipo de solicitação')
    await anuncieForm.locator('.colabore-type-trigger').click()
    await expect(anuncieForm.getByRole('option',{name:'Publicidade',exact:true})).toBeVisible()
    await expect(anuncieForm.getByRole('option',{name:'Patrocínio',exact:true})).toBeVisible()
    await expect(anuncieForm.getByRole('option',{name:'Parceria comercial',exact:true})).toBeVisible()
    await expect(anuncieForm.getByRole('option',{name:'Conteúdo patrocinado',exact:true})).toBeVisible()
    await expect(page.getByText(/registrada no CRM como novo lead comercial/i)).toHaveCount(0)
  })
})
