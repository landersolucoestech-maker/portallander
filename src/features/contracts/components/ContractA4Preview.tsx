import type {ContractDocument} from '../domain'
export function ContractA4Preview({document}:{document:Pick<ContractDocument,'headerHtml'|'contentHtml'|'footerHtml'>}){
 return <div className="contracts-a4-shell"><article className="contracts-a4" aria-label="Preview A4 do contrato"><header dangerouslySetInnerHTML={{__html:document.headerHtml||'<p>Portal Lander</p>'}}/><main dangerouslySetInnerHTML={{__html:document.contentHtml||'<p>Documento sem conteúdo.</p>'}}/><footer dangerouslySetInnerHTML={{__html:document.footerHtml||''}}/></article></div>
}
