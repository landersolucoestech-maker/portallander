import type { ReactNode } from 'react'

export function ContractA4Preview({title='CONTRATO',children}:{title?:string;children?:ReactNode}){
  return <div className="reference-contract-preview"><article className="reference-a4"><h1>{title}</h1>{children??<><p>Documento contratual em preparação.</p><h2>CLÁUSULA PRIMEIRA — DO OBJETO</h2><p>O presente instrumento formaliza as condições acordadas entre as partes, conforme informações cadastradas no contrato.</p><h2>CLÁUSULA SEGUNDA — DAS CONDIÇÕES</h2><p>As condições, prazos, valores e responsabilidades serão preenchidos a partir das variáveis e partes definidas no fluxo de criação.</p></>}</article></div>
}
