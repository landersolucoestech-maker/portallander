import {FileText} from 'lucide-react'
import type {ContractDocument} from '../domain'
import {SafeContractHtml} from './SafeContractHtml'

export function ContractA4Preview({document}:{document:Pick<ContractDocument,'headerHtml'|'contentHtml'|'footerHtml'>}){
 const empty=!document.headerHtml.trim()&&!document.contentHtml.trim()&&!document.footerHtml.trim()
 if(empty)return <div className="contracts-a4-empty"><FileText size={46}/><strong>Preview do documento</strong><span>Preencha o conteúdo para visualizar o contrato em formato A4.</span></div>
 return <div className="contracts-a4-shell"><article className="contracts-a4" aria-label="Preview A4 do contrato"><header>{document.headerHtml?<SafeContractHtml html={document.headerHtml}/>:<div className="contracts-a4-placeholder">Sem cabeçalho configurado</div>}</header><main><SafeContractHtml html={document.contentHtml||'<p>Documento sem conteúdo.</p>'}/></main><footer>{document.footerHtml?<SafeContractHtml html={document.footerHtml}/>:<div className="contracts-a4-placeholder">Sem rodapé configurado</div>}</footer></article></div>
}
