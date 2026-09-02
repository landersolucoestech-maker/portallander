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
      active:true,
      imageUrl:image,
      linkUrl:'/anuncie',
      adLayoutVersion:2,
      adWidthDesktop:0,
      adWidthTablet:0,
      adWidthMobile:0,
      adHeightDesktop:600,
      adHeightTablet:420,
      adHeightMobile:360,
      adImageFit:'contain',
      adLinkEnabled:true,
      adLinkTarget:'same',
    }
    localStorage.setItem(key,JSON.stringify(current))
  },{key:storageKey,image:portraitCreative})
  await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
  await page.locator('.official-publicidade-lateral').waitFor({state:'visible'})
}

async function changeSidebarCreative(page:Page,imageUrl:string){
  await page.evaluate(({key,eventName,image})=>{
    const current=JSON.parse(localStorage.getItem(key)||'{}')
    current['home:publicidade-lateral']={...(current['home:publicidade-lateral']||{}),imageUrl:image}
    localStorage.setItem(key,JSON.stringify(current))
    window.dispatchEvent(new CustomEvent(eventName,{detail:{pageId:'home',sectionId:'publicidade-lateral'}}))
  },{key:storageKey,eventName:sectionEvent,image:imageUrl})
}

test.describe('home advertising layout contract',()=>{
  test.use({viewport:{width:1440,height:900}})

  test('sidebar creative ignores fixed legacy height and keeps intrinsic portrait ratio',async({page})=>{
    await seedSidebarCreative(page)
    const ad=page.locator('.official-publicidade-lateral')
    const image=ad.locator('.pl-home-sidebar-ad-image')
    await expect(image).toBeVisible()
    const adBox=await ad.boundingBox()
    const imageBox=await image.boundingBox()
    expect(adBox).not.toBeNull()
    expect(imageBox).not.toBeNull()
    if(adBox&&imageBox){
      expect(imageBox.width).toBeGreaterThanOrEqual(adBox.width-4)
      expect(imageBox.width).toBeGreaterThan(200)
      expect(imageBox.height).toBeGreaterThan(imageBox.width*1.8)
      expect(Math.abs(adBox.height-imageBox.height)).toBeLessThanOrEqual(2)
    }
  })

  test('sidebar creative recalculates on replace and disappears completely on remove',async({page})=>{
    await seedSidebarCreative(page)
    const ad=page.locator('.official-publicidade-lateral')
    const image=ad.locator('.pl-home-sidebar-ad-image')
    const portraitBox=await image.boundingBox()
    expect(portraitBox).not.toBeNull()

    await changeSidebarCreative(page,landscapeCreative)
    await expect(image).toHaveAttribute('src',landscapeCreative)
    const landscapeBox=await image.boundingBox()
    expect(landscapeBox).not.toBeNull()
    if(portraitBox&&landscapeBox){
      expect(landscapeBox.width).toBeGreaterThan(200)
      expect(landscapeBox.height).toBeLessThan(landscapeBox.width*.6)
      expect(landscapeBox.height).toBeLessThan(portraitBox.height)
    }

    const trendingBefore=await page.locator('.official-em-alta').boundingBox()
    await changeSidebarCreative(page,'')
    await expect(ad).toHaveCount(0)
    const trendingAfter=await page.locator('.official-em-alta').boundingBox()
    expect(trendingBefore).not.toBeNull()
    expect(trendingAfter).not.toBeNull()
    if(trendingBefore&&trendingAfter)expect(trendingAfter.y).toBeLessThan(trendingBefore.y)
  })

  test('most read stays at five items and advertising starts immediately below it',async({page})=>{
    await seedSidebarCreative(page)
    const stack=page.locator('.official-home-sidebar-stack')
    const mostRead=stack.locator('.official-mais-lidas')
    const ad=stack.locator('.official-publicidade-lateral')
    const trending=stack.locator('.official-em-alta')
    await expect(mostRead.locator('.pl-ranked')).toHaveCount(5)
    await expect(ad).toBeVisible()
    await expect(trending).toBeVisible()
    const mostReadBox=await mostRead.boundingBox()
    const adBox=await ad.boundingBox()
    const trendingBox=await trending.boundingBox()
    expect(mostReadBox).not.toBeNull()
    expect(adBox).not.toBeNull()
    expect(trendingBox).not.toBeNull()
    if(mostReadBox&&adBox&&trendingBox){
      const gapAfterMostRead=adBox.y-(mostReadBox.y+mostReadBox.height)
      const gapAfterAd=trendingBox.y-(adBox.y+adBox.height)
      expect(gapAfterMostRead).toBeGreaterThanOrEqual(0)
      expect(gapAfterMostRead).toBeLessThanOrEqual(40)
      expect(gapAfterAd).toBeGreaterThanOrEqual(0)
      expect(gapAfterAd).toBeLessThanOrEqual(40)
    }
  })
})
