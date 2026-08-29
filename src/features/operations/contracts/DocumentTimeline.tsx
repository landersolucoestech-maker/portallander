import { CheckCircle, Clock, FileText, PenLine, Send } from 'lucide-react'

type TimelineItem={label:string;detail:string;date?:string;state?:'done'|'pending'}

export function DocumentTimeline({items}:{items?:TimelineItem[]}){
  const data=items??[
    {label:'Contrato criado',detail:'Documento cadastrado no sistema',date:'Hoje',state:'done'},
    {label:'Documento preparado',detail:'Conteúdo revisado e pronto para assinatura',date:'Hoje',state:'done'},
    {label:'Enviado para assinatura',detail:'Aguardando envio para a plataforma',state:'pending'},
    {label:'Assinaturas concluídas',detail:'Será concluído após todos os signatários',state:'pending'},
  ]
  const icons=[FileText,CheckCircle,Send,PenLine]
  return <div className="reference-timeline">{data.map((item,index)=>{const Icon=icons[index]??Clock;return <div key={`${item.label}-${index}`}><span/><div><strong><Icon size={12}/> {item.label}</strong><small>{item.detail}{item.date?` · ${item.date}`:''}</small></div></div>})}</div>
}
