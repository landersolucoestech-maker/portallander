type SortDirection='asc'|'desc'
type SortState={column:number;direction:SortDirection}

const TABLE_SCOPE='.rh-page .rh-table,.marketing-page .marketing-campaign-table,.marketing-page .marketing-task-table,.marketing-page .marketing-briefing-table'
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

function syncButtons(table:HTMLTableElement,state:SortState){
  table.querySelectorAll<HTMLButtonElement>('.portal-auto-sort-buttons button').forEach(button=>{
    const active=Number(button.dataset.column)===state.column&&button.dataset.direction===state.direction
    button.classList.toggle('active',active)
    button.setAttribute('aria-pressed',active?'true':'false')
  })
}

function decorateTable(table:HTMLTableElement){
  const headers=Array.from(table.tHead?.rows[0]?.cells??[])
  headers.forEach((header,index)=>{
    const th=header as HTMLTableCellElement
    if(th.classList.contains('select')||th.classList.contains('actions')||th.classList.contains('actions-col'))return
    if(th.querySelector('input[type="checkbox"]'))return

    const existingButtons=th.querySelector('.portal-auto-sort-buttons')
    if(th.dataset.portalSort==='ready'&&existingButtons)return
    if(th.dataset.portalSort==='ready'&&!existingButtons)delete th.dataset.portalSort

    const nativeSort=th.querySelector('.crm-sort-header:not(.portal-auto-sort-header)')
    if(nativeSort)return

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
      button.dataset.column=String(index)
      button.dataset.direction=direction
      button.setAttribute('aria-label',`${label}: ordem ${direction==='asc'?'crescente':'decrescente'}`)
      button.setAttribute('aria-pressed','false')
      button.addEventListener('click',event=>{
        event.preventDefault()
        event.stopPropagation()
        const next={column:index,direction}
        states.set(table,next)
        syncButtons(table,next)
        applySort(table,next)
      })
      group.appendChild(button)
    })
    wrap.append(text,group)
    th.appendChild(wrap)
  })
  const state=states.get(table)
  if(state){syncButtons(table,state);applySort(table,state)}
}

function scan(){
  if(applying)return
  document.querySelectorAll<HTMLTableElement>(TABLE_SCOPE).forEach(decorateTable)
}

export function installRhMarketingTableSorting(){
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
  const observer=new MutationObserver(()=>rescan())
  observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true})
}
