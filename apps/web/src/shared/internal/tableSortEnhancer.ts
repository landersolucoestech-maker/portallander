type SortDirection='asc'|'desc'
type SortState={column:number;direction:SortDirection}

const TABLE_SCOPE='.rh-page table,.marketing-page table'
const states=new WeakMap<HTMLTableElement,SortState>()
let applying=false

function parseValue(raw:string){
  const value=raw.trim()
  const brDate=value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if(brDate)return Number(`${brDate[3]}${brDate[2]}${brDate[1]}`)
  const money=value.replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.')
  if(money&&/^[-+]?\d+(?:\.\d+)?$/.test(money))return Number(money)
  return value.toLocaleLowerCase('pt-BR')
}

function compare(a:string,b:string,direction:SortDirection){
  const left=parseValue(a),right=parseValue(b)
  const result=typeof left==='number'&&typeof right==='number'?left-right:String(left).localeCompare(String(right),'pt-BR',{numeric:true,sensitivity:'base'})
  return direction==='asc'?result:-result
}

function applySort(table:HTMLTableElement,state:SortState){
  const body=table.tBodies[0]
  if(!body)return
  const rows=Array.from(body.rows)
  rows.sort((a,b)=>compare(a.cells[state.column]?.textContent??'',b.cells[state.column]?.textContent??'',state.direction))
  applying=true
  rows.forEach(row=>body.appendChild(row))
  applying=false
}

function decorateTable(table:HTMLTableElement){
  const headers=Array.from(table.tHead?.rows[0]?.cells??[])
  headers.forEach((header,index)=>{
    const th=header as HTMLTableCellElement
    if(th.dataset.portalSort==='ready'||th.classList.contains('select')||th.classList.contains('actions')||th.classList.contains('actions-col'))return
    if(th.querySelector('input[type="checkbox"],.crm-sort-header'))return
    const label=(th.textContent??'').trim()
    if(!label||/^ações$/i.test(label)||/^selecionar$/i.test(label))return
    th.dataset.portalSort='ready'
    th.textContent=''
    const wrap=document.createElement('div')
    wrap.className='crm-sort-header portal-auto-sort-header'
    const text=document.createElement('span')
    text.textContent=label
    const group=document.createElement('div')
    group.className='portal-auto-sort-buttons'
    group.setAttribute('role','group')
    group.setAttribute('aria-label',`Ordenar ${label}`)
    ;(['asc','desc'] as const).forEach(direction=>{
      const button=document.createElement('button')
      button.type='button'
      button.textContent=direction==='asc'?'↑':'↓'
      button.setAttribute('aria-label',`${label}: ordem ${direction==='asc'?'crescente':'decrescente'}`)
      button.addEventListener('click',event=>{
        event.stopPropagation()
        states.set(table,{column:index,direction})
        group.querySelectorAll('button').forEach(item=>item.classList.remove('active'))
        button.classList.add('active')
        applySort(table,{column:index,direction})
      })
      group.appendChild(button)
    })
    wrap.append(text,group)
    th.appendChild(wrap)
    const state=states.get(table)
    if(state?.column===index){
      const buttons=group.querySelectorAll('button')
      buttons[state.direction==='asc'?0:1]?.classList.add('active')
    }
  })
  const state=states.get(table)
  if(state)applySort(table,state)
}

function scan(){
  if(applying)return
  document.querySelectorAll<HTMLTableElement>(TABLE_SCOPE).forEach(decorateTable)
}

export function installRhMarketingTableSorting(){
  if(typeof document==='undefined')return
  queueMicrotask(scan)
  const observer=new MutationObserver(()=>scan())
  observer.observe(document.documentElement,{childList:true,subtree:true})
}
