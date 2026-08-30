import type {MouseEvent,ComponentProps} from 'react'
import {ContractWizardPortal} from './ContractWizardPortal'

type ContractWizardProps=ComponentProps<typeof ContractWizardPortal>

export function ContractWizard(props:ContractWizardProps){
 const handleBackdropClick=(event:MouseEvent<HTMLDivElement>)=>{
  const target=event.target as HTMLElement
  if(target.classList.contains('crm-modal-backdrop'))props.onClose()
 }
 return <div onClickCapture={handleBackdropClick}><ContractWizardPortal {...props}/></div>
}
