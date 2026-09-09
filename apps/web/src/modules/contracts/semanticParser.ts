export interface SemanticFinding{originalText:string;placeholder:string;context:string}
export interface SemanticParseResult{variables:SemanticFinding[];clauseTypes:string[];rawText:string}

type Pattern=[RegExp,string,string]
const patterns:Pattern[]=[
 [/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,'{{CONTRATANTE.CPF}}','CPF'],
 [/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,'{{CONTRATANTE.CNPJ}}','CNPJ'],
 [/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'{{CONTRATANTE.EMAIL}}','E-mail'],
 [/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}[-\s]?\d{4}/g,'{{CONTRATANTE.PHONE}}','Telefone'],
 [/R\$\s?[\d.]+,\d{2}/g,'{{PAYMENT.AMOUNT}}','Valor monetário'],
 [/\b(?:BRL|USD|EUR)\b/g,'{{PAYMENT.CURRENCY}}','Moeda'],
 [/\b\d{1,3}\s*(?:parcelas?|x)\b/gi,'{{PAYMENT.INSTALLMENTS}}','Parcelamento'],
 [/\b\d{2}\/\d{2}\/\d{4}\b/g,'{{CONTRACT.START_DATE}}','Data contratual'],
 [/\b(?:Rua|Avenida|Av\.|Alameda|Travessa|Rodovia)\s+[^\n,;]{4,}/gi,'{{CONTRATANTE.ADDRESS}}','Endereço'],
 [/\b(?:campanha|ação publicitária)\s+(?:denominada|chamada|intitulada)?\s*["“]?([^\n"”]{3,80})/gi,'{{CAMPAIGN.NAME}}','Campanha'],
 [/\b(?:evento)\s+(?:denominado|chamado|intitulado)?\s*["“]?([^\n"”]{3,80})/gi,'{{EVENT.NAME}}','Evento'],
 ]

const clausePatterns:Array<[RegExp,string]>=[
 [/confidencial|sigilo/i,'confidencialidade'],
 [/rescis|distrat|encerramento antecipado/i,'rescisao'],
 [/multa|juros|inadimpl/i,'financeira'],
 [/direito de imagem|uso de imagem/i,'direito_imagem'],
 [/conte[uú]do|cess[aã]o|licen[çc]a|direito de uso/i,'conteudo_licenciamento'],
 [/publicidade|campanha|veicula|m[ií]dia paga/i,'publicidade'],
 [/evento|cobertura|credenciamento/i,'evento'],
 [/assinatura|signat|testemunha/i,'assinatura'],
 [/obriga|entreg[aá]vel|escopo|prazo de entrega/i,'obrigacoes'],
 [/representante legal|representada por/i,'representacao'],
 [/parcel|vencimento|forma de pagamento/i,'pagamento'],
 [/vig[eê]ncia|prazo contratual|data de in[ií]cio|data de t[eé]rmino/i,'vigencia'],
]

export function parseContractText(text:string):SemanticParseResult{
 const variables:SemanticFinding[]=[];const seen=new Set<string>()
 for(const [regex,placeholder,context] of patterns){regex.lastIndex=0;for(const match of text.match(regex)??[]){const id=`${placeholder}:${match}`;if(!seen.has(id)){seen.add(id);variables.push({originalText:match.trim(),placeholder,context})}}}
 for(const placeholder of text.match(/\{\{[A-Z][A-Z0-9_]*\.[A-Z][A-Z0-9_]*\}\}/g)??[])if(!seen.has(placeholder)){seen.add(placeholder);variables.push({originalText:placeholder,placeholder,context:'Placeholder existente'})}
 const clauseTypes=clausePatterns.filter(([regex])=>regex.test(text)).map(([,name])=>name)
 return {variables,clauseTypes,rawText:text}
}
