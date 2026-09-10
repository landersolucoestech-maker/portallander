import {expect,test,type Page} from '@playwright/test'

const base='http://127.0.0.1:4173/portallander/'
const routes=[
 '/app/dashboard',
 '/app/crm',
 '/app/finance',
 '/app/agenda',
 '/app/chat',
 '/app/hr',
 '/app/metrics',
 '/app/marketing',
 '/app/settings',
] as const
const viewports=[
 {name:'mobile',width:390,height:844},
 {name:'tablet',width:768,height:1024},
 {name:'desktop',width:1440,height:900},
] as const
const tolerance=.6

type Geometry={
 route:string
 header:{x:number;y:number;width:number;height:number}
 main:{x:number;y:number;width:number;paddingLeft:number;paddingRight:number;paddingTop:number}
 heading:{x:number;y:number;width:number;height:number}|null
 iconControl:{width:number;height:number}|null
 tokens:{headerHeight:number;pageInline:number;pageBlockStart:number;controlMd:number}
}

const close=(a:number,b:number)=>Math.abs(a-b)<=tolerance

async function openRoute(page:Page,route:string){
 await page.goto(`${base}#${route}`,{waitUntil:'domcontentloaded'})
 await page.locator('#root').waitFor({state:'attached'})
 await page.locator('.app-shell .workspace-main').waitFor({state:'visible'})
 await page.locator('.app-shell .workspace-top').waitFor({state:'visible'})
 await page.evaluate(async()=>{try{if(document.fonts)await document.fonts.ready}catch{/* geometry remains measurable */}})
 await page.waitForTimeout(80)
}

async function measure(page:Page,route:string):Promise<Geometry>{
 return page.evaluate(currentRoute=>{
  const px=(value:string)=>Number.parseFloat(value)||0
  const rect=(selector:string)=>{
   const node=document.querySelector<HTMLElement>(selector)
   if(!node)return null
   const value=node.getBoundingClientRect()
   return {x:value.x,y:value.y,width:value.width,height:value.height}
  }
  const shell=document.querySelector<HTMLElement>('.app-shell')!
  const header=document.querySelector<HTMLElement>('.workspace-top')!
  const main=document.querySelector<HTMLElement>('.workspace-main')!
  const shellStyle=getComputedStyle(shell)
  const mainStyle=getComputedStyle(main)
  const headerRect=header.getBoundingClientRect()
  const mainRect=main.getBoundingClientRect()
  const mobile=innerWidth<=760
  const tablet=innerWidth>760&&innerWidth<=1080
  const pageInline=px(shellStyle.getPropertyValue(mobile?'--ui-page-inline-mobile':tablet?'--ui-page-inline-tablet':'--ui-page-inline'))
  const pageBlockStart=px(shellStyle.getPropertyValue(mobile?'--ui-page-block-start-mobile':'--ui-page-block-start'))
  return {
   route:currentRoute,
   header:{x:headerRect.x,y:headerRect.y,width:headerRect.width,height:headerRect.height},
   main:{x:mainRect.x,y:mainRect.y,width:mainRect.width,paddingLeft:px(mainStyle.paddingLeft),paddingRight:px(mainStyle.paddingRight),paddingTop:px(mainStyle.paddingTop)},
   heading:rect('.workspace-page-heading'),
   iconControl:rect('.workspace-actions .icon-button'),
   tokens:{
    headerHeight:px(shellStyle.getPropertyValue('--ui-header-height')),
    pageInline,
    pageBlockStart,
    controlMd:px(shellStyle.getPropertyValue('--ui-control-md')),
   },
  }
 },route)
}

for(const viewport of viewports){
 test(`shared admin geometry is invariant at ${viewport.name}`,async({page})=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height})
  const measurements:Geometry[]=[]
  for(const route of routes){
   await openRoute(page,route)
   measurements.push(await measure(page,route))
  }

  console.log(`UI_GEOMETRY_MEASUREMENTS ${viewport.name} ${JSON.stringify(measurements)}`)
  const baseline=measurements[0]
  for(const current of measurements){
   expect(close(current.header.x,baseline.header.x),`${current.route}: header x-axis`).toBeTruthy()
   expect(close(current.header.width,baseline.header.width),`${current.route}: header width`).toBeTruthy()
   expect(close(current.header.height,current.tokens.headerHeight),`${current.route}: header token height`).toBeTruthy()
   expect(close(current.header.height,baseline.header.height),`${current.route}: header height`).toBeTruthy()

   expect(close(current.main.x,baseline.main.x),`${current.route}: main x-axis`).toBeTruthy()
   expect(close(current.main.width,baseline.main.width),`${current.route}: main width`).toBeTruthy()
   expect(close(current.main.paddingLeft,current.tokens.pageInline),`${current.route}: left gutter token`).toBeTruthy()
   expect(close(current.main.paddingRight,current.tokens.pageInline),`${current.route}: right gutter token`).toBeTruthy()
   expect(close(current.main.paddingTop,current.tokens.pageBlockStart),`${current.route}: top spacing token`).toBeTruthy()
   expect(close(current.main.paddingLeft,baseline.main.paddingLeft),`${current.route}: left gutter`).toBeTruthy()
   expect(close(current.main.paddingRight,baseline.main.paddingRight),`${current.route}: right gutter`).toBeTruthy()

   if(current.heading&&baseline.heading){
    expect(close(current.heading.y,baseline.heading.y),`${current.route}: page heading vertical axis`).toBeTruthy()
   }
   if(current.iconControl){
    expect(close(current.iconControl.width,current.tokens.controlMd),`${current.route}: icon control width`).toBeTruthy()
    expect(close(current.iconControl.height,current.tokens.controlMd),`${current.route}: icon control height`).toBeTruthy()
   }
  }
 })
}
