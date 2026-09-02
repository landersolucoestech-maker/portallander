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

test.describe('responsive home section administration',()=>{
  test('all requested editors expose Desktop Tablet Mobile and independent active control',async({page})=>{
    for(const id of ['em-destaque','ultimas-noticias','lancamentos','agenda','em-alta','anuncie-aqui']){
      await page.goto(`${base}#/app/site/paginas/home/secoes/${id}`,{waitUntil:'domcontentloaded'})
      await expect(page.getByRole('button',{name:/Desktop/})).toBeVisible()
      await expect(page.getByRole('button',{name:/Tablet/})).toBeVisible()
      await expect(page.getByRole('button',{name:/Mobile/})).toBeVisible()
      await expect(page.locator('.section-config-switch input[type="checkbox"]').first()).toBeVisible()
    }
  })

  test('featured manual selection, quantity and responsive columns reach frontend',async({page})=>{
    await seed(page,{'em-destaque':{
      active:true,itemLimit:2,homeLayoutVersion:2,homeSelectionMode:'manual',homeSortMode:'provider',
      homeManualSelection:['Radar de lançamentos da semana','Cidade em Movimento'],
      homeColumnsDesktop:2,homeColumnsTablet:2,homeColumnsMobile:1,
      homeGapDesktop:18,homeGapTablet:14,homeGapMobile:10,
      homeMarginYDesktop:0,homeMarginYTablet:0,homeMarginYMobile:0,
      homePaddingXDesktop:0,homePaddingXTablet:0,homePaddingXMobile:0,
      homePaddingYDesktop:0,homePaddingYTablet:0,homePaddingYMobile:0,
    }})
    await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    const section=page.locator('.official-em-destaque')
    await expect(section.locator('.pl-card')).toHaveCount(2)
    await expect(section.locator('.pl-card h3').first()).toHaveText('Radar de lançamentos da semana')
    const columns=await section.locator('.pl-card-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)
    expect(columns).toBe(2)
    await page.setViewportSize({width:390,height:844})
    const mobileColumns=await section.locator('.pl-card-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)
    expect(mobileColumns).toBe(1)
  })

  test('zero items is allowed while explicit disable removes the section without container',async({page})=>{
    await seed(page,{'ultimas-noticias':{active:true,itemLimit:0,homeLayoutVersion:2}})
    await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    await expect(page.locator('.official-ultimas-noticias')).toBeVisible()
    await expect(page.locator('.official-ultimas-noticias .pl-card')).toHaveCount(0)
    await page.evaluate(({key})=>{const current=JSON.parse(localStorage.getItem(key)||'{}');current['home:ultimas-noticias']={...(current['home:ultimas-noticias']||{}),active:false};localStorage.setItem(key,JSON.stringify(current));window.dispatchEvent(new CustomEvent('portal-lander:section-configurations:changed',{detail:{pageId:'home',sectionId:'ultimas-noticias'}}))},{key:storageKey})
    await expect(page.locator('.official-ultimas-noticias')).toHaveCount(0)
  })

  test('agenda window and configured amount are consumed',async({page})=>{
    await seed(page,{'agenda':{active:true,itemLimit:2,homeLayoutVersion:2,homeAgendaWindow:'all',homeSelectionMode:'automatic',homeColumnsDesktop:1,homeColumnsTablet:1,homeColumnsMobile:1}})
    await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    await expect(page.locator('.official-agenda .pl-agenda-item')).toHaveCount(2)
  })

  test('Anuncie Aqui consumes configured creative alt and whole-area link',async({page})=>{
    const image='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22300%22%3E%3Crect width=%22600%22 height=%22300%22 fill=%22black%22/%3E%3C/svg%3E'
    await seed(page,{'anuncie-aqui':{active:true,imageUrl:image,linkUrl:'/anuncie',adLayoutVersion:3,adImageAlt:'Banner comercial de teste',adLinkEnabled:true,adLinkTarget:'same',adImageFit:'contain',adWidthDesktop:0,adWidthTablet:0,adWidthMobile:0,adHeightDesktop:0,adHeightTablet:0,adHeightMobile:0}})
    await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
    const ad=page.locator('.official-secao-anuncie-aqui')
    await expect(ad.locator('img[alt="Banner comercial de teste"]')).toBeVisible()
    await expect(ad.locator('a.pl-ad-area-link')).toHaveAttribute('href',/anuncie/)
  })
})
