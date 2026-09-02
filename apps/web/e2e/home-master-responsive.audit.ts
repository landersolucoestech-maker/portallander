import {expect,test} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const widths=[320,360,375,390,430,768,820,1024,1280,1440]

test.describe('Home master responsive viewport matrix',()=>{
  for(const width of widths){
    test(`${width}px has no horizontal document overflow and keeps core sections reachable`,async({page})=>{
      await page.setViewportSize({width,height:1000})
      await page.goto(`${base}#/`,{waitUntil:'domcontentloaded'})
      await expect(page.locator('.public-header')).toBeVisible()
      await expect(page.locator('.editorial-hero')).toBeVisible()
      await expect(page.locator('.official-em-destaque')).toBeVisible()
      await expect(page.locator('.official-mais-lidas')).toBeVisible()
      await expect(page.locator('.official-publicidade-lateral')).toBeVisible()
      await expect(page.locator('.official-em-alta')).toBeVisible()
      await expect(page.locator('.official-lancamentos')).toBeVisible()
      await expect(page.locator('.official-agenda')).toBeVisible()
      await expect(page.locator('.pl-newsletter')).toBeVisible()
      await expect(page.locator('.public-footer')).toBeVisible()
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(1)
      const primaryColumns=await page.locator('.official-home-primary-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length)
      expect(primaryColumns).toBe(width<=1023?1:2)
    })
  }
})
