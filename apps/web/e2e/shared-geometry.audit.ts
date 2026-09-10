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

type BoxSample={selector:string;height:number;minHeight:number;paddingTop:number;paddingRight:number;paddingBottom:number;paddingLeft:number;fontSize:number}
type ComponentGeometry={
 route:string
 tokens:{controlMd:number;controlSm:number;kpiMinHeight:number;kpiPadding:number;tableRowHeight:number;tableCellBlock:number;tableCellInline:number;paginationMinHeight:number;paginationControl:number;paginationBlock:number;paginationInline:number}
 defaultControls:BoxSample[]
 compactControls:BoxSample[]
 kpis:BoxSample[]
 tableHeaders:BoxSample[]
 tableCells:BoxSample[]
 paginations:BoxSample[]
 paginationControls:BoxSample[]
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

async function measureComponents(page:Page,route:string):Promise<ComponentGeometry>{
 return page.evaluate(currentRoute=>{
  const px=(value:string)=>Number.parseFloat(value)||0
  const shell=document.querySelector<HTMLElement>('.app-shell')!
  const shellStyle=getComputedStyle(shell)
  const samples=(selector:string)=>Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(node=>{
   const rect=node.getBoundingClientRect(),style=getComputedStyle(node)
   return rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden'
  }).map(node=>{
   const style=getComputedStyle(node),rect=node.getBoundingClientRect()
   return {selector:`${node.tagName.toLowerCase()}.${Array.from(node.classList).join('.')}`,height:rect.height,minHeight:px(style.minHeight),paddingTop:px(style.paddingTop),paddingRight:px(style.paddingRight),paddingBottom:px(style.paddingBottom),paddingLeft:px(style.paddingLeft),fontSize:px(style.fontSize)}
  })
  const defaultSelector='.crm-btn,.agenda-toolbar .button,.agenda-toolbar select,.agenda-toolbar .agenda-icon-button,.contracts-filters select,.contracts-registry select,.finance-filters>input,.finance-filters>select,.finance-search,.contracts-search,.crm-search,.crm-filter-selects select,.crm-inline-select,.agenda-search,.marketing-primary,.marketing-secondary,.settings-primary,.settings-outline,.settings-danger'
  const compactSelector='.rh-primary,.rh-secondary,.rh-danger-button,.rh-filters>input,.rh-filters>select,.rh-search,.rh-doc-selector select,.rh-field input,.rh-field select,.marketing-filters>select,.marketing-filters>input,.marketing-search,.marketing-calendar-toolbar>select,.marketing-period-button'
  const kpiSelector='.admin-kpi,.crm-kpi,.finance-kpi,.contracts-kpi,.rh-kpi,.marketing-kpi,.dashboard-stat-card'
  const tableHeaderSelector='.crm-table th,.finance-table th,.contracts-table th,.rh-table th,.marketing-table th,.settings-table-wrap th'
  const tableCellSelector='.crm-table td,.finance-table td,.contracts-table td,.rh-table td,.marketing-table td,.settings-table-wrap td'
  const paginationSelector='.crm-pagination,.finance-pagination,.contracts-pagination,.rh-pagination,.marketing-pagination,.tableview-pagination'
  const paginationControlSelector='.crm-pagination button,.finance-pagination button,.contracts-pagination button,.rh-pagination button,.marketing-pagination button,.tableview-pagination button,.tableview-page-size select'
  return {
   route:currentRoute,
   tokens:{
    controlMd:px(shellStyle.getPropertyValue('--ui-control-md')),
    controlSm:px(shellStyle.getPropertyValue('--ui-control-sm')),
    kpiMinHeight:px(shellStyle.getPropertyValue('--ui-kpi-min-height')),
    kpiPadding:px(shellStyle.getPropertyValue('--ui-kpi-padding')),
    tableRowHeight:px(shellStyle.getPropertyValue('--ui-table-row-height')),
    tableCellBlock:px(shellStyle.getPropertyValue('--ui-table-cell-block')),
    tableCellInline:px(shellStyle.getPropertyValue('--ui-table-cell-inline')),
    paginationMinHeight:px(shellStyle.getPropertyValue('--ui-pagination-min-height')),
    paginationControl:px(shellStyle.getPropertyValue('--ui-pagination-control')),
    paginationBlock:px(shellStyle.getPropertyValue('--ui-pagination-block')),
    paginationInline:px(shellStyle.getPropertyValue('--ui-pagination-inline')),
   },
   defaultControls:samples(defaultSelector),
   compactControls:samples(compactSelector),
   kpis:samples(kpiSelector),
   tableHeaders:samples(tableHeaderSelector),
   tableCells:samples(tableCellSelector),
   paginations:samples(paginationSelector),
   paginationControls:samples(paginationControlSelector),
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

   if(current.heading&&baseline.heading)expect(close(current.heading.y,baseline.heading.y),`${current.route}: page heading vertical axis`).toBeTruthy()
   if(current.iconControl){
    expect(close(current.iconControl.width,current.tokens.controlMd),`${current.route}: icon control width`).toBeTruthy()
    expect(close(current.iconControl.height,current.tokens.controlMd),`${current.route}: icon control height`).toBeTruthy()
   }
  }
 })

 test(`shared admin components consume canonical geometry at ${viewport.name}`,async({page})=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height})
  const measurements:ComponentGeometry[]=[]
  for(const route of routes){
   await openRoute(page,route)
   measurements.push(await measureComponents(page,route))
  }
  console.log(`UI_COMPONENT_GEOMETRY ${viewport.name} ${JSON.stringify(measurements)}`)

  const totals={defaultControls:0,compactControls:0,kpis:0,tableHeaders:0,tableCells:0,paginations:0,paginationControls:0}
  for(const current of measurements){
   for(const sample of current.defaultControls){
    totals.defaultControls++
    expect(sample.height,`${current.route} ${sample.selector}: default control height`).toBeGreaterThanOrEqual(current.tokens.controlMd-tolerance)
    expect(close(sample.minHeight,current.tokens.controlMd),`${current.route} ${sample.selector}: default control min-height token`).toBeTruthy()
   }
   for(const sample of current.compactControls){
    totals.compactControls++
    expect(sample.height,`${current.route} ${sample.selector}: compact control height`).toBeGreaterThanOrEqual(current.tokens.controlSm-tolerance)
    expect(close(sample.minHeight,current.tokens.controlSm),`${current.route} ${sample.selector}: compact control min-height token`).toBeTruthy()
   }
   for(const sample of current.kpis){
    totals.kpis++
    expect(close(sample.minHeight,current.tokens.kpiMinHeight),`${current.route} ${sample.selector}: KPI min-height token`).toBeTruthy()
    expect(close(sample.paddingTop,current.tokens.kpiPadding),`${current.route} ${sample.selector}: KPI top padding`).toBeTruthy()
    expect(close(sample.paddingRight,current.tokens.kpiPadding),`${current.route} ${sample.selector}: KPI right padding`).toBeTruthy()
    expect(close(sample.paddingBottom,current.tokens.kpiPadding),`${current.route} ${sample.selector}: KPI bottom padding`).toBeTruthy()
    expect(close(sample.paddingLeft,current.tokens.kpiPadding),`${current.route} ${sample.selector}: KPI left padding`).toBeTruthy()
   }
   for(const sample of current.tableHeaders){
    totals.tableHeaders++
    expect(close(sample.paddingTop,current.tokens.tableCellBlock),`${current.route} ${sample.selector}: table header top padding`).toBeTruthy()
    expect(close(sample.paddingBottom,current.tokens.tableCellBlock),`${current.route} ${sample.selector}: table header bottom padding`).toBeTruthy()
    expect(close(sample.paddingLeft,current.tokens.tableCellInline),`${current.route} ${sample.selector}: table header left padding`).toBeTruthy()
    expect(close(sample.paddingRight,current.tokens.tableCellInline),`${current.route} ${sample.selector}: table header right padding`).toBeTruthy()
    expect(close(sample.fontSize,11),`${current.route} ${sample.selector}: table header font-size`).toBeTruthy()
   }
   for(const sample of current.tableCells){
    totals.tableCells++
    expect(sample.height,`${current.route} ${sample.selector}: table row height`).toBeGreaterThanOrEqual(current.tokens.tableRowHeight-tolerance)
    expect(close(sample.paddingTop,current.tokens.tableCellBlock),`${current.route} ${sample.selector}: table cell top padding`).toBeTruthy()
    expect(close(sample.paddingBottom,current.tokens.tableCellBlock),`${current.route} ${sample.selector}: table cell bottom padding`).toBeTruthy()
    expect(close(sample.paddingLeft,current.tokens.tableCellInline),`${current.route} ${sample.selector}: table cell left padding`).toBeTruthy()
    expect(close(sample.paddingRight,current.tokens.tableCellInline),`${current.route} ${sample.selector}: table cell right padding`).toBeTruthy()
    expect(close(sample.fontSize,12),`${current.route} ${sample.selector}: table cell font-size`).toBeTruthy()
   }
   for(const sample of current.paginations){
    totals.paginations++
    expect(close(sample.minHeight,current.tokens.paginationMinHeight),`${current.route} ${sample.selector}: pagination min-height`).toBeTruthy()
    expect(close(sample.paddingTop,current.tokens.paginationBlock),`${current.route} ${sample.selector}: pagination top padding`).toBeTruthy()
    expect(close(sample.paddingBottom,current.tokens.paginationBlock),`${current.route} ${sample.selector}: pagination bottom padding`).toBeTruthy()
    expect(close(sample.paddingLeft,current.tokens.paginationInline),`${current.route} ${sample.selector}: pagination left padding`).toBeTruthy()
    expect(close(sample.paddingRight,current.tokens.paginationInline),`${current.route} ${sample.selector}: pagination right padding`).toBeTruthy()
   }
   for(const sample of current.paginationControls){
    totals.paginationControls++
    expect(close(sample.height,current.tokens.paginationControl),`${current.route} ${sample.selector}: pagination control height`).toBeTruthy()
    expect(close(sample.minHeight,current.tokens.paginationControl),`${current.route} ${sample.selector}: pagination control min-height`).toBeTruthy()
   }
  }

  expect(totals.defaultControls,'default control family must be exercised').toBeGreaterThan(0)
  expect(totals.compactControls,'compact control family must be exercised').toBeGreaterThan(0)
  expect(totals.kpis,'KPI family must be exercised').toBeGreaterThan(0)
  expect(totals.tableHeaders,'table header family must be exercised').toBeGreaterThan(0)
  expect(totals.tableCells,'table cell family must be exercised').toBeGreaterThan(0)
  expect(totals.paginations,'pagination family must be exercised').toBeGreaterThan(0)
  expect(totals.paginationControls,'pagination controls must be exercised').toBeGreaterThan(0)
 })
}
