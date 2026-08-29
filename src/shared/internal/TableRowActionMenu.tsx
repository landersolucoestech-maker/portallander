import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function TableRowActionMenu({label,onView,onEdit,onDelete}:{label:string;onView:()=>void;onEdit:()=>void;onDelete:()=>void}){
  const [open,setOpen]=useState(false)
  const root=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(!open)return
    const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)}
    document.addEventListener('pointerdown',close)
    return()=>document.removeEventListener('pointerdown',close)
  },[open])
  const run=(action:()=>void)=>{setOpen(false);action()}
  return <div className="table-row-actions" ref={root}>
    <button type="button" className="table-row-actions-trigger" aria-label={`Ações de ${label}`} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(value=>!value)}><EllipsisVertical size={16}/></button>
    {open&&<div className="table-row-actions-menu" role="menu">
      <button type="button" role="menuitem" onClick={()=>run(onView)}><Eye size={14}/>Ver</button>
      <button type="button" role="menuitem" onClick={()=>run(onEdit)}><Pencil size={14}/>Editar</button>
      <button type="button" role="menuitem" className="danger" onClick={()=>run(onDelete)}><Trash2 size={14}/>Excluir</button>
    </div>}
  </div>
}
