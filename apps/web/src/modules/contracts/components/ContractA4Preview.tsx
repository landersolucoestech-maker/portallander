import {FileText} from 'lucide-react'
import type {ContractDocument} from '../domain'
import {sanitizeContractHtml} from '../sanitizeContractHtml'

export function ContractA4Preview({document}:{document:Pick<ContractDocument,'headerHtml'|'contentHtml'|'footerHtml'>}){
 const empty=!document.headerHtml.trim()&&!document.contentHtml.trim()&&!document.footerHtml.trim()
 if(empty)return <div className="contracts-a4-empty"><FileText size={46}/><strong>Preview do documento</strong><span>Preencha o conteúdo para visualizar o contrato em formato A4.</span></div>
 const headerHtml=sanitizeContractHtml(document.headerHtml)
 const contentHtml=sanitizeContractHtml(document.contentHtml||'<p>Documento sem conteúdo.</p>')
 const footerHtml=sanitizeContractHtml(document.footerHtml)
 return <div className="contracts-a4-shell"><article className="contracts-a4" aria-label="Preview A4 do contrato"><header>{headerHtml?<div dangerouslySetInnerHTML={{__html:headerHtml}}/>:<div className="contracts-a4-placeholder">Sem cabeçalho configurado</div>}</header><main dangerouslySetInnerHTML={{__html:contentHtml}}/><footer>{footerHtml?<div dangerouslySetInnerHTML={{__html:footerHtml}}/>:<div className="contracts-a4-placeholder">Sem rodapé configurado</div>}</footer></article></div>
}
