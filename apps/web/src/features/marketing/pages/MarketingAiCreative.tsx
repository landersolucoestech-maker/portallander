import {BarChart3,CalendarDays,Clock,Lightbulb,Send,Sparkles,TrendingUp,UserRound} from 'lucide-react'
import {useState} from 'react'
import {Link} from 'react-router-dom'
import type {MarketingSeed} from '../domain'
import {Card,Empty} from '../MarketingUi'

const tabs=[['ideas','Ideias',Lightbulb],['profile','Perfil',UserRound],['pitching','Pitching',Send],['trends','Tendências',TrendingUp],['analytics','Métricas',BarChart3],['planning','Planejamento',CalendarDays],['history','Histórico',Clock]] as const
type Tab=(typeof tabs)[number][0]

const descriptions:Record<Exclude<Tab,'history'|'analytics'>,{title:string;description:string}>={
  ideas:{title:'Geração de ideias',description:'Criação de ideias, legendas, roteiros, chamadas e variações criativas.'},
  profile:{title:'Perfil e posicionamento',description:'Análise de posicionamento, narrativa, pilares editoriais e tom de voz.'},
  pitching:{title:'Pitching',description:'Estruturação de apresentação de pautas, campanhas e oportunidades.'},
  trends:{title:'Tendências',description:'Análise de sinais de mercado e comportamento com fonte e período verificáveis.'},
  planning:{title:'Planejamento',description:'Planejamento assistido por IA para horizontes operacionais definidos.'},
}

export function MarketingAiCreative({state}:{state:MarketingSeed}){
  const [tab,setTab]=useState<Tab>('ideas')
  return <>
    <div className="marketing-ai-tabs marketing-ai-tabs-reference" role="tablist" aria-label="Áreas da IA Criativa">{tabs.map(([id,label,Icon])=><button key={id} type="button" className={tab===id?'active':''} onClick={()=>setTab(id)} role="tab" aria-selected={tab===id}><Icon size={15}/>{label}</button>)}</div>
    <div className="marketing-ai-content">{tab==='history'?<LegacyHistory state={state}/>:tab==='analytics'?<AnalyticsGateway/>:<UnavailableAiCapability tab={tab}/>}</div>
  </>
}

function UnavailableAiCapability({tab}:{tab:Exclude<Tab,'history'|'analytics'>}){
  const info=descriptions[tab]
  return <div className="marketing-ai-workflow">
    <section className="marketing-card marketing-ai-question">
      <header><div><span className="marketing-eyebrow">IA CRIATIVA</span><h3>{info.title}</h3></div></header>
      <div className="marketing-card-body"><div className="marketing-ai-empty-callout"><strong>PROVIDER DE IA NÃO CONECTADO</strong><p>{info.description}</p><p>O Portal Lander não possui atualmente endpoint ou skill de geração criativa registrado. Esta área permanece disponível como módulo, mas nenhuma resposta local, mock ou simulada será apresentada como IA real.</p></div></div>
    </section>
    <section className="marketing-card marketing-ai-result-card">
      <header><h3>Resultado</h3></header>
      <div className="marketing-card-body"><Empty empty text="BLOCKED_EXTERNAL — conecte um provider real de IA antes de habilitar geração, regeneração ou salvamento de resultados."/></div>
    </section>
  </div>
}

function AnalyticsGateway(){
  return <div className="marketing-ai-workflow">
    <section className="marketing-card marketing-ai-question"><header><div><span className="marketing-eyebrow">MÉTRICAS REAIS</span><h3>Analytics do Marketing</h3></div></header><div className="marketing-card-body"><Card title="Fonte canônica" description="Métricas não são inferidas pela IA Criativa"><p>Use o submódulo Métricas para consultar Analytics com proveniência, estados LIVE/CACHED/MANUAL/STALE e unavailable explícito.</p><Link className="marketing-primary marketing-generate-button" to="/app/marketing/metricas"><BarChart3 size={14}/>Abrir Métricas</Link></Card></div></section>
    <section className="marketing-card marketing-ai-result-card"><header><h3>Diagnóstico por IA</h3></header><div className="marketing-card-body"><Empty empty text="BLOCKED_EXTERNAL — diagnósticos gerados por IA permanecem desabilitados enquanto não houver provider real."/></div></section>
  </div>
}

function LegacyHistory({state}:{state:MarketingSeed}){
  return <div className="marketing-ai-workflow">
    <section className="marketing-card marketing-ai-question"><header><div><span className="marketing-eyebrow">HISTÓRICO</span><h3>Registros anteriores</h3></div></header><div className="marketing-card-body"><div className="marketing-ai-empty-callout"><strong>HISTÓRICO LOCAL LEGADO</strong><p>Versões anteriores deste módulo produziam texto local determinístico sem provider de IA. Esses registros são preservados para não apagar dados do navegador, mas não são classificados como geração de IA válida.</p></div></div></section>
    <section className="marketing-card marketing-ai-result-card"><header><h3>Registros preservados</h3></header><div className="marketing-card-body">{state.aiHistory.length?<div className="marketing-stack">{state.aiHistory.map(item=><div className="marketing-ai-history" key={item.id}><div><strong>{item.title}</strong><small>{new Date(item.createdAt).toLocaleString('pt-BR')} · LEGACY_LOCAL · {item.kind}</small></div><p>Conteúdo legado ocultado nesta superfície porque não possui proveniência de provider de IA real.</p></div>)}</div>:<Empty empty text="Nenhum registro legado armazenado."/>}</div></section>
  </div>
}
