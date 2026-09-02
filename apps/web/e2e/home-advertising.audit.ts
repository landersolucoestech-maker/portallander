import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const storageKey='portal-lander:cms:section-configurations:v1'
const sectionEvent='portal-lander:section-configurations:changed'
const portraitCreative='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22600%22%20viewBox%3D%220%200%20300%20600%22%3E%3Crect%20width%3D%22300%22%20height%3D%22600%22%20fill%3D%22%23111111%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22260%22%20height%3D%22560%22%20fill%3D%22%23e50914%22%2F%3E%3C%2Fsvg%3E'
const landscapeCreative='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22300%22%20viewBox%3D%220%200%20600%20300%22%3E%3Crect%20width%3D%22600%22%20height%3D%22300%22%20fill%3D%22%23111111%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22560%22%20height%3D%22260%22%20fill%3D%22%23e50914%22%2F%3E%3C%2Fsvg%3E'

async function seedSidebarCreative(page:Page){
  await page.addInitScript(({key,image})=>{
    const current=JSON.parse(localStorage.getItem(key)||'{}')
    current['home:publicidade-lateral']={
      ...(current['home:publicidade-lateral']||{}),
      active:true,title:'PUBLICIDADE',eyebrow:'ANUNCIE AQUI',description:'Sua marca pode aparecer neste espaço.',imageUrl:image,linkLabel:'SAIBA MAIS',linkUrl:'/anuncie',
      adLayoutVersion:2,adWidthDesktop:0,adWidthTablet:0,adWidthMobile:0,adHeightDesktop:600,adHeightTablet:420,adHeightMobile:360,adImageFit:'contain',adLinkEnabled:true,adLinkTarget:'same',
    }
    localStorage.setItem(key,JSON.stringify(current))
  },{key:storageKey,image:portraitCreative})
  await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
  await page.locator('.official-publicidade-lateral').waitFor({state:'visible'})
}

async function patchSidebar(page:Page,patch:Record<string,unknown>){
  await page.evaluate(({key,eventName,next})=>{
    const current=JSON.parse(localStorage.getItem(key)||'{}')
    current['home:publicidade-lateral']={...(current['home:publicidade-lateral']||{}),...next}
    localStorage.setItem(key,JSON.stringify(current))
    window.dispatchEvent(new CustomEvent(eventName,{detail:{pageId:'home',sectionId:'publicidade-lateral'}}))
  },{key:storageKey,eventName:sectionEvent,next:patch})
}

async function patchMostRead(page:Page,patch:Record<string,unknown>){
  await page.evaluate(({key,eventName,next})=>{
    const current=JSON.parse(localStorage.getItem(key)||'{}')
    current['home:mais-lidas']={...(current['home:mais-lidas']||{}),...next}
    localStorage.setItem(key,JSON.stringify(current))
    window.dispatchEvent(new CustomEvent(eventName,{detail:{pageId:'home',sectionId:'mais-lidas'}}))
  },{key:storageKey,eventName:sectionEvent,next:patch})
}

test.describe('home advertising layout contract',()=>{
  test.use({viewport:{width:1440,height:900}})

  test('sidebar creative ignores fixed legacy height and keeps intrinsic portrait ratio',async({page})=>{
    await seedSidebarCreative(page)
    const ad=page.locator('.official-publicidade-lateral')
    const image=ad.locator('.pl-home-sidebar-ad-image')
    await expect(image).toBeVisible()
    const adBox=await ad.boundingBox();const imageBox=await image.boundingBox()
    expect(adBox).not.toBeNull();expect(imageBox).not.toBeNull()
    if(adBox&&imageBox){expect(imageBox.width).toBeGreaterThanOrEqual(adBox.width-4);expect(imageBox.width).toBeGreaterThan(200);expect(imageBox.height).toBeGreaterThan(imageBox.width*1.8);expect(Math.abs(adBox.height-imageBox.height)).toBeLessThanOrEqual(2)}
  })

  test('sidebar recalculates on replace, keeps configurable sized fallback on remove, and hides only when disabled',async({page})=>{
    await seedSidebarCreative(page)
    const ad=page.locator('.official-publicidade-lateral');const image=ad.locator('.pl-home-sidebar-ad-image');const portraitBox=await image.boundingBox();expect(portraitBox).not.toBeNull()
    await patchSidebar(page,{imageUrl:landscapeCreative});await expect(image).toHaveAttribute('src',landscapeCreative)
    const landscapeBox=await image.boundingBox();expect(landscapeBox).not.toBeNull()
    if(portraitBox&&landscapeBox){expect(landscapeBox.width).toBeGreaterThan(200);expect(landscapeBox.height).toBeLessThan(landscapeBox.width*.6);expect(landscapeBox.height).toBeLessThan(portraitBox.height)}
    await patchSidebar(page,{imageUrl:'',adWidthDesktop:220,adHeightDesktop:300})
    await expect(ad).toBeVisible();await expect(ad).toHaveClass(/is-empty/);await expect(ad.locator('.pl-home-sidebar-ad-image')).toHaveCount(0);await expect(ad.locator('.pl-home-sidebar-ad-fallback')).toBeVisible()
    await expect(ad.getByText('ANUNCIE AQUI',{exact:true})).toBeVisible();await expect(ad.getByText('PUBLICIDADE',{exact:true})).toBeVisible();await expect(ad.getByText('Sua marca pode aparecer neste espaço.',{exact:true})).toBeVisible();await expect(ad.getByText('SAIBA MAIS →',{exact:true})).toBeVisible();await expect(ad.locator('a[href*="/anuncie"]')).toHaveCount(1)
    const emptyBox=await ad.boundingBox();expect(emptyBox).not.toBeNull();if(emptyBox){expect(Math.abs(emptyBox.width-220)).toBeLessThanOrEqual(2);expect(Math.abs(emptyBox.height-300)).toBeLessThanOrEqual(2)}
    await patchSidebar(page,{active:false});await expect(ad).toHaveCount(0)
  })

  test('sidebar editor exposes fallback content, desktop reference dimensions and full-page preview',async({page})=>{
    await page.goto(`${base}#/app/site/paginas/home/secoes/publicidade-lateral`,{waitUntil:'domcontentloaded'})
    await expect(page.getByText('Conteúdo exibido quando não houver imagem',{exact:true})).toBeVisible()
    await expect(page.getByText('Título principal',{exact:true})).toBeVisible()
    await expect(page.getByText('Texto do botão',{exact:true})).toBeVisible()
    await expect(page.getByText(/Largura ·/).first()).toBeVisible()
    await expect(page.getByText(/Altura ·/).first()).toBeVisible()
    const frame=page.frameLocator('.home-page-preview-iframe')
    await expect(frame.locator('.public-page')).toBeVisible()
    await expect(frame.locator('.official-em-destaque')).toBeVisible()
    await expect(frame.locator('.official-publicidade-lateral')).toBeVisible()
    await expect(frame.locator('.official-lancamentos')).toBeVisible()
  })

  test('Mais Lidas supports 1 to 5 items and can be disabled',async({page})=>{
    await seedSidebarCreative(page)
    const mostRead=page.locator('.official-mais-lidas')
    await patchMostRead(page,{active:true,itemLimit:3});await expect(mostRead.locator('.pl-ranked')).toHaveCount(3)
    await patchMostRead(page,{itemLimit:99});await expect(mostRead.locator('.pl-ranked')).toHaveCount(5)
    await patchMostRead(page,{itemLimit:1});await expect(mostRead.locator('.pl-ranked')).toHaveCount(1)
    await patchMostRead(page,{active:false});await expect(mostRead).toHaveCount(0)
  })

  test('Mais Lidas editor exposes 1 to 5 and updates the canonical full-page preview draft',async({page})=>{
    await page.goto(`${base}#/app/site/paginas/home/secoes/mais-lidas`,{waitUntil:'domcontentloaded'})
    const quantity=page.getByLabel('Quantidade máxima de conteúdos')
    await expect(quantity).toBeVisible();await expect(quantity.locator('option')).toHaveCount(5)
    const frame=page.frameLocator('.home-page-preview-iframe')
    await expect(frame.locator('.public-page')).toBeVisible()
    await quantity.selectOption('3')
    await expect(frame.locator('.official-mais-lidas .pl-ranked')).toHaveCount(3)
    await expect(frame.locator('.official-mais-lidas')).toHaveClass(/home-admin-preview-target/)
    await expect(page.locator('.section-config-switch input[type="checkbox"]')).toBeVisible()
  })

  test('most read defaults to five items and advertising starts immediately below it',async({page})=>{
    await seedSidebarCreative(page)
    const stack=page.locator('.official-home-sidebar-stack');const mostRead=stack.locator('.official-mais-lidas');const ad=stack.locator('.official-publicidade-lateral');const trending=stack.locator('.official-em-alta')
    await expect(mostRead.locator('.pl-ranked')).toHaveCount(5);await expect(ad).toBeVisible();await expect(trending).toBeVisible()
    const mostReadBox=await mostRead.boundingBox();const adBox=await ad.boundingBox();const trendingBox=await trending.boundingBox();expect(mostReadBox).not.toBeNull();expect(adBox).not.toBeNull();expect(trendingBox).not.toBeNull()
    if(mostReadBox&&adBox&&trendingBox){const gapAfterMostRead=adBox.y-(mostReadBox.y+mostReadBox.height);const gapAfterAd=trendingBox.y-(adBox.y+adBox.height);expect(gapAfterMostRead).toBeGreaterThanOrEqual(0);expect(gapAfterMostRead).toBeLessThanOrEqual(40);expect(gapAfterAd).toBeGreaterThanOrEqual(0);expect(gapAfterAd).toBeLessThanOrEqual(40)}
  })
})
