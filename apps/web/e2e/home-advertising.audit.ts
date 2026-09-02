import {expect,test} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const storageKey='portal-lander:cms:section-configurations:v1'
const portraitCreative='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22600%22%20viewBox%3D%220%200%20300%20600%22%3E%3Crect%20width%3D%22300%22%20height%3D%22600%22%20fill%3D%22%23111111%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22260%22%20height%3D%22560%22%20fill%3D%22%23e50914%22%2F%3E%3C%2Fsvg%3E'

async function seedSidebarCreative(page:Parameters<typeof test>[0] extends never?never:any){
  await page.goto(base,{waitUntil:'domcontentloaded'})
  await page.evaluate(({key,image})=>{
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
      adHeightDesktop:0,
      adHeightTablet:0,
      adHeightMobile:0,
      adImageFit:'contain',
      adLinkEnabled:true,
      adLinkTarget:'same',
    }
    localStorage.setItem(key,JSON.stringify(current))
  },{key:storageKey,image:portraitCreative})
  await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
  await page.locator('.official-publicidade-lateral').waitFor({state:'visible'})
}

test.describe('home advertising layout contract',()=>{
  test.use({viewport:{width:1440,height:900}})

  test('sidebar creative uses the full column width and keeps intrinsic portrait ratio',async({page})=>{
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
    }
  })

  test('most read stays at five items and sidebar flows directly from ad to trending',async({page})=>{
    await seedSidebarCreative(page)
    await expect(page.locator('.official-mais-lidas .pl-ranked')).toHaveCount(5)
    const stack=page.locator('.official-home-sidebar-stack')
    await expect(stack.locator('.official-publicidade-lateral')).toBeVisible()
    await expect(stack.locator('.official-em-alta')).toBeVisible()
    const adBox=await stack.locator('.official-publicidade-lateral').boundingBox()
    const trendingBox=await stack.locator('.official-em-alta').boundingBox()
    expect(adBox).not.toBeNull()
    expect(trendingBox).not.toBeNull()
    if(adBox&&trendingBox){
      const gap=trendingBox.y-(adBox.y+adBox.height)
      expect(gap).toBeGreaterThanOrEqual(0)
      expect(gap).toBeLessThanOrEqual(40)
    }
  })
})
