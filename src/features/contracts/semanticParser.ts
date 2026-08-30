export interface SemanticFinding{originalText:string;placeholder:string;context:string}
export interface SemanticParseResult{variables:SemanticFinding[];clauseTypes:string[];rawText:string}
const patterns:Array<[RegExp,string,string]>=[
 [/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,'{{CONTRATANTE.CPF}}','CPF'],[/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,'{{CONTRATANTE.CNPJ}}','CNPJ'],[/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'{{CONTRATANTE.EMAIL}}','E-mail'],[/R\$\s?[\d.]+,\d{2}/g,'{{PAYMENT.AMOUNT}}','Valor monetário'],[/\b\d{2}\/\d{2}\/\d{4}\b/g,'{{CONTRACT.START_DATE}}','Data contratual'],
]
export function parseContractText(text:string):SemanticParseResult{
 const variables:SemanticFinding[]=[];const seen=new Set<string>()
 for(const [regex,placeholder,context] of patterns)for(const match of text.match(regex)??[]){const id=`${placeholder}:${match}`;if(!seen.has(id)){seen.add(id);variables.push({originalText:match,placeholder,context})}}
 for(const placeholder of text.match(/\{\{[A-Z][A-Z0-9_]*\.[A-Z][A-Z0-9_]*\}\}/g)??[])if(!seen.has(placeholder)){seen.add(placeholder);variables.push({originalText:placeholder,placeholder,context:'Placeholder existente'})}
 const clauses:Array<[RegExp,string]>=[[/confidencial/i,'confidencialidade'],[/rescis|distrat/i,'rescisao'],[/multa|juros/i,'financeira'],[/imagem/i,'direito_imagem'],[/conte[uú]do|cess[aã]o|licen[çc]a/i,'conteudo_licenciamento'],[/publicidade|campanha|veicula/i,'publicidade'],[/evento|cobertura/i,'evento'],[/assinatura|signat/i,'assinatura'],[/obriga|entreg[aá]vel/i,'obrigacoes']]
 return {variables,clauseTypes:clauses.filter(([regex])=>regex.test(text)).map(([,name])=>name),rawText:text}
}
