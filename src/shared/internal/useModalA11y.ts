import {useEffect,useRef} from 'react'

const FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function useModalA11y(onClose:()=>void,active=true){
 const dialogRef=useRef<HTMLElement>(null)
 const closeRef=useRef(onClose)
 closeRef.current=onClose
 useEffect(()=>{
  if(!active)return
  const dialog=dialogRef.current
  if(!dialog)return
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null
  const initial=dialog.querySelector<HTMLElement>(FOCUSABLE)??dialog
  initial.focus()
  const onKeyDown=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){
    event.preventDefault()
    closeRef.current()
    return
   }
   if(event.key!=='Tab')return
   const focusable=Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(element=>element.offsetParent!==null)
   if(!focusable.length){event.preventDefault();dialog.focus();return}
   const first=focusable[0],last=focusable[focusable.length-1]
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
  document.addEventListener('keydown',onKeyDown)
  return()=>{
   document.removeEventListener('keydown',onKeyDown)
   previous?.focus()
  }
 },[active])
 return dialogRef
}
