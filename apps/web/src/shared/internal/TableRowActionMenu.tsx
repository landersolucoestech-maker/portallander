import { EllipsisVertical } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function TableRowActionMenu({label,onView,onEdit,onDelete}:{label:string;onView:()=>void;onEdit?:()=>void;onDelete:()=>void}){
  const [open,setOpen]=useState(false)
  const root=useRef<HTMLDivElement>(null)
  const trigger=useRef<HTMLButtonElement>(null)
  const menu=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(!open)return
    const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)}
    const closeOnKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.current?.focus();return}
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return
      const items=Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')??[])
      if(!items.length)return
      event.preventDefault()
      const current=Math.max(0,items.indexOf(document.activeElement as HTMLButtonElement))
      const next=event.key==='Home'?0:event.key==='End'?items.length-1:event.key==='ArrowDown'?(current+1)%items.length:(current-1+items.length)%items.length
      items[next]?.focus()
    }
    document.addEventListener('pointerdown',close)
    document.addEventListener('keydown',closeOnKey)
    window.requestAnimationFrame(()=>menu.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus())
    return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',closeOnKey)}
  },[open])
  const run=(action:()=>void)=>{setOpen(false);trigger.current?.focus();action()}
  return <div className="table-row-actions" ref={root}>
    <button ref={trigger} type="button" className="table-row-actions-trigger" aria-label={`Ações de ${label}`} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(value=>!value)}><EllipsisVertical size={16}/></button>
    {open&&<div className="table-row-actions-menu" role="menu" ref={menu}>
      <button type="button" role="menuitem" onClick={()=>run(onView)}>Visualizar</button>
      {onEdit&&<button type="button" role="menuitem" onClick={()=>run(onEdit)}>Editar</button>}
      <button type="button" role="menuitem" className="danger" onClick={()=>run(onDelete)}>Excluir</button>
    </div>}
  </div>
}
