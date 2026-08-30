import {FileText} from 'lucide-react'
import type {ContractDocument} from '../domain'

export function ContractA4Preview({document}:{document:Pick<ContractDocument,'headerHtml'|'contentHtml'|'footerHtml'>}){
 const empty=!document.headerHtml.trim()&&!document.contentHtml.trim()&&!document.footerHtml.trim()
 if(empty)return <div className="contracts-a4-empty"><FileText size={46}/><strong>Preview do documento</strong><span>Preencha o conteúdo para visualizar o contrato em formato A4.</span></div>
 return <div className="contracts-a4-shell"><article className="contracts-a4" aria-label="Preview A4 do contrato"><header>{document.headerHtml?<div dangerouslySetInnerHTML={{__html:document.headerHtml}}/>:<div className="contracts-a4-placeholder">Sem cabeçalho configurado</div>}</header><main dangerouslySetInnerHTML={{__html:document.contentHtml||'<p>Documento sem conteúdo.</p>'}}/><footer>{document.footerHtml?<div dangerouslySetInnerHTML={{__html:document.footerHtml}}/>:<div className="contracts-a4-placeholder">Sem rodapé configurado</div>}</footer></article></div>
}
