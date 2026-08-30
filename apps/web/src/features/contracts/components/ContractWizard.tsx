import type {MouseEvent,ComponentProps} from 'react'
import {ContractWizardOriginal} from './ContractWizardOriginal'

type ContractWizardProps=ComponentProps<typeof ContractWizardOriginal>

export function ContractWizard(props:ContractWizardProps){
 const handleBackdropClick=(event:MouseEvent<HTMLDivElement>)=>{
  const target=event.target as HTMLElement
  if(target.classList.contains('crm-modal-backdrop'))props.onClose()
 }
 return <div onClickCapture={handleBackdropClick}><ContractWizardOriginal {...props}/></div>
}
