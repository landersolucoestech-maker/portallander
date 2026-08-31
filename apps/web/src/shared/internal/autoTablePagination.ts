type TableState={page:number;pageSize:number;footer:HTMLElement}

const TABLE_SELECTOR='.app-shell .workspace-main table'
const NATIVE_PAGINATION='.tableview-pagination,.crm-pagination,.finance-pagination,.contracts-pagination,.rh-pagination,.marketing-pagination'
const states=new WeakMap<HTMLTableElement,TableState>()
let scanning=false

function nearestSurface(table:HTMLTableElement){
  return table.closest<HTMLElement>('.crm-table-card,.finance-table-card,.contracts-table-card,.rh-table-card,.marketing-table-card,.settings-card,.table-card,.zip-panel,.tableview-surface')
}

function insertionAnchor(table:HTMLTableElement){
  return table.closest<HTMLElement>('.crm-table-wrap,.finance-table-wrap,.contracts-table-wrap,.rh-table-wrap,.marketing-table-wrap,.settings-table-wrap,.zip-table-wrap,.table-card')??table
}

function hasNativePagination(table:HTMLTableElement){
  const surface=nearestSurface(table)
  if(!surface)return false
  return Array.from(surface.querySelectorAll<HTMLElement>(NATIVE_PAGINATION)).some(node=>node.isConnected&&!node.classList.contains('portal-auto-pagination'))
}

function makeButton(label:string,text:string,onClick:()=>void){
  const button=document.createElement('button')
  button.type='button'
  button.setAttribute('aria-label',label)
  button.textContent=text
  button.addEventListener('click',onClick)
  return button
}

function render(table:HTMLTableElement,state:TableState){
  const rows=Array.from(table.tBodies[0]?.rows??[])
  const total=rows.length
  const totalPages=Math.max(1,Math.ceil(total/state.pageSize))
  state.page=Math.min(Math.max(state.page,1),totalPages)
  const start=total===0?0:(state.page-1)*state.pageSize
  const end=Math.min(start+state.pageSize,total)
  rows.forEach((row,index)=>{row.hidden=index<start||index>=end})

  const footer=state.footer
  footer.replaceChildren()

  const summary=document.createElement('div')
  summary.className='tableview-pagination-summary'
  const totalStrong=document.createElement('strong')
  totalStrong.textContent=String(total)
  const totalLabel=document.createElement('span')
  totalLabel.textContent=total===1?'registro':'registros'
  const range=document.createElement('span')
  range.className='tableview-pagination-range'
  range.textContent=`${total===0?0:start+1}–${end} exibidos`
  summary.append(totalStrong,totalLabel,range)

  const center=document.createElement('div')
  center.className='tableview-pagination-center'
  const first=makeButton('Primeira página','«',()=>{state.page=1;render(table,state)})
  const previous=makeButton('Página anterior','‹',()=>{state.page=Math.max(1,state.page-1);render(table,state)})
  const pageText=document.createElement('span')
  pageText.innerHTML=`Página <strong>${state.page}</strong> de <strong>${totalPages}</strong>`
  const next=makeButton('Próxima página','›',()=>{state.page=Math.min(totalPages,state.page+1);render(table,state)})
  const last=makeButton('Última página','»',()=>{state.page=totalPages;render(table,state)})
  first.disabled=previous.disabled=state.page<=1
  next.disabled=last.disabled=state.page>=totalPages
  center.append(first,previous,pageText,next,last)

  const pageSize=document.createElement('label')
  pageSize.className='tableview-page-size'
  const pageSizeLabel=document.createElement('span')
  pageSizeLabel.textContent='Por página'
  const select=document.createElement('select')
  ;[5,10,20,50].forEach(value=>{const option=document.createElement('option');option.value=String(value);option.textContent=String(value);select.appendChild(option)})
  select.value=String(state.pageSize)
  select.addEventListener('change',()=>{state.pageSize=Number(select.value)||10;state.page=1;render(table,state)})
  pageSize.append(pageSizeLabel,select)
  footer.append(summary,center,pageSize)
}

function createState(table:HTMLTableElement){
  const footer=document.createElement('footer')
  footer.className='tableview-pagination portal-auto-pagination'
  footer.setAttribute('aria-label','Paginação da tabela')
  const anchor=insertionAnchor(table)
  anchor.insertAdjacentElement('afterend',footer)
  const state={page:1,pageSize:10,footer}
  states.set(table,state)
  return state
}

function ensurePagination(table:HTMLTableElement){
  if(table.closest('[role="dialog"],.contracts-a4,.marketing-phone-preview'))return
  if(!table.tBodies.length)return
  if(hasNativePagination(table)){
    const existing=states.get(table)
    if(existing){existing.footer.remove();states.delete(table);Array.from(table.tBodies[0].rows).forEach(row=>{row.hidden=false})}
    return
  }
  let state=states.get(table)
  if(state&&!state.footer.isConnected){states.delete(table);state=undefined}
  state??=createState(table)
  render(table,state)
}

function scan(){
  if(scanning)return
  scanning=true
  try{document.querySelectorAll<HTMLTableElement>(TABLE_SELECTOR).forEach(ensurePagination)}finally{scanning=false}
}

export function installAutoTablePagination(){
  if(typeof document==='undefined')return
  const rescan=()=>requestAnimationFrame(scan)
  scan()
  rescan()
  setTimeout(scan,50)
  setTimeout(scan,250)
  setTimeout(scan,750)
  setTimeout(scan,1500)
  window.addEventListener('hashchange',rescan)
  window.addEventListener('popstate',rescan)
  let scheduled=false
  const observer=new MutationObserver(()=>{
    if(scheduled)return
    scheduled=true
    requestAnimationFrame(()=>{scheduled=false;scan()})
  })
  observer.observe(document.documentElement,{childList:true,subtree:true})
}
