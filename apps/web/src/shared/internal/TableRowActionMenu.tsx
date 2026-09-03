import { EllipsisVertical } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type TableRowActionMenuProps={
  label:string
  onView?:()=>void
  onEdit?:()=>void
  onDelete?:()=>void
  onDuplicate?:()=>void
  viewLabel?:string
  deleteDisabled?:boolean
  align?:'start'|'center'|'end'
}

type MenuPosition={top:number;left:number}

const MENU_GAP=4
const VIEWPORT_GUTTER=12

export function TableRowActionMenu({label,onView,onEdit,onDelete,onDuplicate,viewLabel='Visualizar',deleteDisabled=false,align='end'}:TableRowActionMenuProps){
  const [open,setOpen]=useState(false)
  const [position,setPosition]=useState<MenuPosition|null>(null)
  const root=useRef<HTMLDivElement>(null)
  const trigger=useRef<HTMLButtonElement>(null)
  const menu=useRef<HTMLDivElement>(null)

  const placeMenu=()=>{
    const anchor=trigger.current
    if(!anchor)return
    const anchorRect=anchor.getBoundingClientRect()
    const menuRect=menu.current?.getBoundingClientRect()
    const menuWidth=Math.max(menuRect?.width??148,148)
    const menuHeight=menuRect?.height??116
    const availableBelow=window.innerHeight-anchorRect.bottom-VIEWPORT_GUTTER
    const openUp=availableBelow<menuHeight&&anchorRect.top>menuHeight+VIEWPORT_GUTTER
    const top=openUp
      ? Math.max(VIEWPORT_GUTTER,anchorRect.top-menuHeight-MENU_GAP)
      : Math.min(window.innerHeight-menuHeight-VIEWPORT_GUTTER,anchorRect.bottom+MENU_GAP)
    const left=Math.min(
      Math.max(VIEWPORT_GUTTER,anchorRect.right-menuWidth),
      window.innerWidth-menuWidth-VIEWPORT_GUTTER,
    )
    setPosition({top,left})
  }

  useEffect(()=>{
    if(!open)return
    placeMenu()
    const frame=window.requestAnimationFrame(()=>{
      placeMenu()
      menu.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus()
    })
    const close=(event:PointerEvent)=>{
      const target=event.target as Node
      if(root.current?.contains(target)||menu.current?.contains(target))return
      setOpen(false)
    }
    const closeOnKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.current?.focus();return}
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return
      const items=Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')??[])
      if(!items.length)return
      event.preventDefault()
      const activeIndex=items.indexOf(document.activeElement as HTMLButtonElement)
      const current=activeIndex>=0?activeIndex:0
      const next=event.key==='Home'?0:event.key==='End'?items.length-1:event.key==='ArrowDown'?(current+1)%items.length:(current-1+items.length)%items.length
      items[next]?.focus()
    }
    document.addEventListener('pointerdown',close)
    document.addEventListener('keydown',closeOnKey)
    window.addEventListener('resize',placeMenu)
    window.addEventListener('scroll',placeMenu,true)
    return()=>{
      window.cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown',close)
      document.removeEventListener('keydown',closeOnKey)
      window.removeEventListener('resize',placeMenu)
      window.removeEventListener('scroll',placeMenu,true)
    }
  },[open])

  const toggle=()=>{
    if(open){setOpen(false);return}
    placeMenu()
    setOpen(true)
  }
  const run=(action:()=>void)=>{setOpen(false);trigger.current?.focus();action()}

  const menuContent=open&&position
    ? createPortal(
        <div
          className="table-row-actions-menu"
          role="menu"
          ref={menu}
          style={{position:'fixed',top:position.top,left:position.left,right:'auto',zIndex:1000}}
        >
          {onView&&<button type="button" role="menuitem" onClick={()=>run(onView)}>{viewLabel}</button>}
          {onEdit&&<button type="button" role="menuitem" onClick={()=>run(onEdit)}>Editar</button>}
          {onDelete&&<button type="button" role="menuitem" className="danger" disabled={deleteDisabled} onClick={()=>run(onDelete)}>Excluir</button>}
          {onDuplicate&&<button type="button" role="menuitem" onClick={()=>run(onDuplicate)}>Duplicar</button>}
        </div>,
        document.body,
      )
    : null

  const triggerContent=<div className="table-row-actions" ref={root}>
    <button ref={trigger} type="button" className="table-row-actions-trigger" aria-label={`Ações de ${label}`} aria-haspopup="menu" aria-expanded={open} onClick={toggle}><EllipsisVertical size={16}/></button>
  </div>

  const alignedTrigger=align==='end'
    ? triggerContent
    : <div style={{width:32,marginLeft:align==='center'?'auto':0,marginRight:align==='center'?'auto':'auto'}}>{triggerContent}</div>

  return <>
    {alignedTrigger}
    {menuContent}
  </>
}
