import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const storageKey='portal-lander:cms:section-configurations:v1'

async function seed(page:Page,patches:Record<string,Record<string,unknown>>){
  await page.addInitScript(({key,patches})=>{
    const current=JSON.parse(localStorage.getItem(key)||'{}')
    for(const [id,patch] of Object.entries(patches))current[`home:${id}`]={...(current[`home:${id}`]||{}),...patch}
    localStorage.setItem(key,JSON.stringify(current))
  },{key:storageKey,patches})
}
const columnCount=async(page:Page,selector:string)=>page.locator(selector).evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length)

test.describe('responsive home section administration',()=>{
  test('configurable Home editors expose responsive preview without separate content sources',async({page})=>{
    for(const id of ['hero','em-destaque','mais-lidas','ultimas-noticias','lancamentos','agenda','em-alta','anuncie-aqui']){
      await page.goto(`${base}#/app/site/paginas/home/secoes/${id}`,{waitUntil:'domcontentloaded'})
      await expect(page.getByRole('button',{name:/Desktop/}).first()).toBeVisible()
      await expect(page.getByRole('button',{name:/Tablet/}).first()).toBeVisible()
      await expect(page.getByRole('button',{name:/Mobile/}).first()).toBeVisible()
    }
  })

  test('featured manual selection and quantity reach frontend while legacy device columns cannot redesign it',async({page})=>{
    await seed(page,{'em-destaque':{
      active:true,itemLimit:2,homeLayoutVersion:2,homeSelectionMode:'manual',homeSortMode:'provider',
      homeManualSelection:['Radar de lançamentos da semana','Cidade em Movimento'],
      homeColumnsDesktop:1,homeColumnsTablet:4,homeColumnsMobile:2,
    }})
    await page.setViewportSize({width:1440,height:900})
    await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    const section=page.locator('.official-em-destaque')
    await expect(section.locator('.pl-card')).toHaveCount(2)
    await expect(section.locator('.pl-card h3').first()).toHaveText('Radar de lançamentos da semana')
    expect(await columnCount(page,'.official-em-destaque .pl-card-grid')).toBe(3)
    await page.setViewportSize({width:820,height:1100})
    expect(await columnCount(page,'.official-em-destaque .pl-card-grid')).toBe(2)
    await page.setViewportSize({width:390,height:844})
    expect(await columnCount(page,'.official-em-destaque .pl-card-grid')).toBe(1)
  })

  test('latest and releases follow canonical desktop tablet mobile grids',async({page})=>{
    await seed(page,{
      'ultimas-noticias':{active:true,itemLimit:4,homeSelectionMode:'automatic'},
      lancamentos:{active:true,itemLimit:4,homeSelectionMode:'automatic'},
    })
    await page.setViewportSize({width:1440,height:900});await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    expect(await columnCount(page,'.official-ultimas-noticias .pl-latest-grid')).toBe(2)
    expect(await columnCount(page,'.official-lancamentos .pl-release-row')).toBe(4)
    await page.setViewportSize({width:820,height:1100})
    expect(await columnCount(page,'.official-ultimas-noticias .pl-latest-grid')).toBe(2)
    expect(await columnCount(page,'.official-lancamentos .pl-release-row')).toBe(2)
    await page.setViewportSize({width:390,height:844})
    expect(await columnCount(page,'.official-ultimas-noticias .pl-latest-grid')).toBe(1)
    expect(await columnCount(page,'.official-lancamentos .pl-release-row')).toBe(1)
  })

  test('zero items is allowed while explicit disable removes the section without container',async({page})=>{
    await seed(page,{'ultimas-noticias':{active:true,itemLimit:0,homeSelectionMode:'automatic'}})
    await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    await expect(page.locator('.official-ultimas-noticias')).toBeVisible()
    await expect(page.locator('.official-ultimas-noticias .pl-card')).toHaveCount(0)
    await page.evaluate(({key})=>{const current=JSON.parse(localStorage.getItem(key)||'{}');current['home:ultimas-noticias']={...(current['home:ultimas-noticias']||{}),active:false};localStorage.setItem(key,JSON.stringify(current));window.dispatchEvent(new CustomEvent('portal-lander:section-configurations:changed',{detail:{pageId:'home',sectionId:'ultimas-noticias'}}))},{key:storageKey})
    await expect(page.locator('.official-ultimas-noticias')).toHaveCount(0)
  })

  test('sidebars remain present and stack into the main flow on tablet and mobile',async({page})=>{
    await seed(page,{'mais-lidas':{active:true},'publicidade-lateral':{active:true},'em-alta':{active:true}})
    await page.setViewportSize({width:820,height:1100});await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    await expect(page.locator('.official-mais-lidas')).toBeVisible()
    await expect(page.locator('.official-publicidade-lateral')).toBeVisible()
    await expect(page.locator('.official-em-alta')).toBeVisible()
    expect(await page.locator('.official-home-primary-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1)
  })

  test('agenda window and configured amount are consumed',async({page})=>{
    await seed(page,{'agenda':{active:true,itemLimit:2,homeAgendaWindow:'all',homeSelectionMode:'automatic'}})
    await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    await expect(page.locator('.official-agenda .pl-agenda-item')).toHaveCount(2)
  })

  test('Anuncie Aqui consumes configured creative alt and whole-area link',async({page})=>{
    const image='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22300%22%3E%3Crect width=%22600%22 height=%22300%22 fill=%22black%22/%3E%3C/svg%3E'
    await seed(page,{'anuncie-aqui':{active:true,imageUrl:image,linkUrl:'/anuncie',adImageAlt:'Banner comercial de teste',adLinkEnabled:true,adLinkTarget:'same',adImageFit:'contain'}})
    await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    const ad=page.locator('.official-secao-anuncie-aqui')
    await expect(ad.locator('img[alt="Banner comercial de teste"]')).toBeVisible()
    await expect(ad.locator('a.pl-ad-area-link')).toHaveAttribute('href',/anuncie/)
  })
})
