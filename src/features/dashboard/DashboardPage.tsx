import { Activity, AlertTriangle, Calendar, DollarSign, FileText, RefreshCw, Shield, Users } from 'lucide-react'
import { AdminShell } from '../../shared/internal/AdminUi'
import { CRM_WORKSPACE_NAV } from '../../shared/internal/adminNavigation'
import { useActivityHistory } from './hooks/useActivityHistory'
import { useMetrics } from './hooks/useMetrics'
import type { AuditLogRow } from './types'

const fmtMoney=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value)
const fmtValue=(value:number|null,formatter?:(value:number)=>string)=>value==null?'–':formatter?formatter(value):String(value)

const entityLabel:Record<string,string>={artists:'Artista',artistas:'Artista',contracts:'Contrato',contratos:'Contrato',releases:'Lançamento',lancamentos:'Lançamento',works:'Obra',obras:'Obra',phonograms:'Fonograma',fonogramas:'Fonograma',leads:'CRM',transactions:'Accounting',transacoes:'Accounting',events:'Agenda',eventos:'Agenda'}

function activityDescription(row:AuditLogRow){
  const after=row.after??{}
  const name=after.titulo??after.nome_artistico??after.nome??row.entity_id??'—'
  const action=({create:'criado',created:'criado',update:'atualizado',updated:'atualizado',delete:'removido',deleted:'removido',sign:'assinado',signed:'assinado'} as Record<string,string>)[row.action.toLowerCase()]??row.action
  return {label:`${entityLabel[row.entity]??row.entity} ${action}`,description:String(name)}
}

function normalizeActivity(rows:AuditLogRow[]){
  const unique=new Map<string,AuditLogRow>()
  for(const row of rows)if(!unique.has(row.id))unique.set(row.id,row)
  return [...unique.values()].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,30)
}

function timeAgo(raw:string){
  const date=new Date(raw)
  if(!Number.isFinite(date.getTime()))return '—'
  const seconds=Math.max(0,Math.floor((Date.now()-date.getTime())/1000))
  if(seconds<60)return `${seconds}s atrás`
  const minutes=Math.floor(seconds/60)
  if(minutes<60)return `${minutes}min atrás`
  const hours=Math.floor(minutes/60)
  if(hours<24)return `${hours}h atrás`
  return date.toLocaleDateString('pt-BR')
}

function SourceUnavailable({title,description}:{title:string;description:string}){
  return <div className="dashboard-source-unavailable"><AlertTriangle size={20}/><div><strong>{title}</strong><p>{description}</p></div></div>
}

function DashboardSkeleton(){
  return <div className="dashboard-reference-kpis dashboard-loading-kpis" aria-label="Carregando métricas">{Array.from({length:4},(_,index)=><article key={index} className="dashboard-stat-card dashboard-stat-skeleton"><span/><strong/><small/></article>)}</div>
}

export default function DashboardPage(){
  const {metrics,dashboard,isLoading,error,refetch}=useMetrics()
  const history=useActivityHistory(30)
  const historyItems=normalizeActivity(history.data??[])
  const alerts=dashboard?[ 
    ['Tarefas atrasadas',dashboard.overdue_tasks_count,'danger'],
    ['Invoices vencidas',dashboard.overdue_invoices_count,'danger'],
    ['Sincronizações com falha',dashboard.failed_external_syncs,'danger'],
    ['Contratos vencendo em 30 dias',dashboard.contracts_expiring_soon_count,'warning'],
    ['Tarefas pendentes',dashboard.pending_tasks_count,'info'],
    ['Onboardings em andamento',dashboard.onboarding_in_progress_count,'info'],
    ['Setups de distribuição pendentes',dashboard.pending_distribution_setups,'info'],
    ['Sincronizações externas pendentes',dashboard.pending_external_syncs,'info'],
  ].filter((item)=>Number(item[1])>0).slice(0,9):[]

  return <AdminShell area="crm" items={CRM_WORKSPACE_NAV} header={{title:'Dashboard',description:'Visão geral do seu negócio musical'}} headerActions={[{label:'Atualizar dados',onClick:()=>void refetch(),variant:'secondary'}]}>
    <section className="dashboard-reference-page" aria-busy={isLoading}>
      {error&&<SourceUnavailable title="Não foi possível carregar as métricas" description="O contrato GET /api/v1/analytics/dashboard está configurado, mas este repositório não possui backend conectado. Nenhum zero foi fabricado para substituir a falha."/>}

      {isLoading?<DashboardSkeleton/>:<div className="dashboard-reference-kpis">
        <article className="dashboard-stat-card"><div><span>Artistas Cadastrados</span><strong>{fmtValue(metrics.totalArtistas)}</strong><small>{metrics.artistasComContrato==null?'Dados indisponíveis':`${metrics.artistasComContrato} com contrato ativo`}</small></div><Users size={17}/></article>
        <article className="dashboard-stat-card"><div><span>Contratos Vigentes</span><strong>{fmtValue(metrics.contratosAtivos)}</strong><small>{metrics.contratosVencendo==null?'Dados indisponíveis':metrics.contratosVencendo>0?`${metrics.contratosVencendo} vencendo em 30 dias`:'Todos em dia'}</small></div><FileText size={17}/></article>
        <article className="dashboard-stat-card"><div><span>Receita Total</span><strong>{fmtValue(metrics.receitaMensal,fmtMoney)}</strong><small>Período atual</small></div><DollarSign size={17}/></article>
        <article className="dashboard-stat-card"><div><span>Eventos do Mês</span><strong>{fmtValue(metrics.eventosMes)}</strong><small>{metrics.eventosMes==null?'Fonte de eventos não disponível neste repositório':'No mês atual'}</small></div><Calendar size={17}/></article>
      </div>}

      {alerts.length>0&&<section className="dashboard-attention"><div className="dashboard-section-heading"><div><h2>Atenção Operacional</h2><p>Pontos que exigem acompanhamento</p></div><AlertTriangle size={18}/></div><div className="dashboard-alert-grid">{alerts.map(([label,value,variant])=><article key={String(label)} className={`dashboard-alert dashboard-alert-${variant}`}><strong>{String(value)}</strong><span>{String(label)}</span></article>)}</div></section>}

      <div className="dashboard-reference-split">
        <section className="dashboard-reference-panel"><div className="dashboard-section-heading"><div><h2>Atividades Recentes</h2><p>Todas as ações realizadas no sistema</p></div><Activity size={18}/></div><div className="dashboard-panel-body dashboard-activity-list">{history.isLoading?<div className="dashboard-skeleton-list"><span/><span/><span/></div>:history.error?<SourceUnavailable title="Histórico indisponível" description="GET /api/v1/audit-logs?limit=30 não respondeu. O feed não foi substituído por atividade fictícia."/>:historyItems.length>0?historyItems.map(row=>{const item=activityDescription(row);return <article key={row.id}><span className="dashboard-activity-icon"><Shield size={14}/></span><div><strong>{item.label}</strong><p>{item.description}</p></div><time>{timeAgo(row.created_at)}</time></article>}):<div className="dashboard-empty"><Activity size={24}/><strong>Nenhuma atividade registrada</strong><p>As ações auditadas aparecerão aqui quando a API estiver conectada.</p></div>}</div></section>

        <section className="dashboard-reference-panel"><div className="dashboard-section-heading"><div><h2>Próximos Compromissos</h2><p>Compromissos agendados em ordem cronológica</p></div><Calendar size={18}/></div><div className="dashboard-panel-body"><SourceUnavailable title="Agenda indisponível" description="O módulo Agenda e seu contrato de listagem foram removidos anteriormente. O Dashboard não cria endpoint ou compromisso fictício para preencher esta área."/></div></section>
      </div>

      <section className="dashboard-reference-panel dashboard-artists-panel"><div className="dashboard-section-heading"><div><h2>Artistas em Destaque</h2><p>Artistas com maior relevância no período</p></div><Users size={18}/></div><div className="dashboard-panel-body"><SourceUnavailable title="Artistas indisponíveis" description="O projeto atual não possui o módulo de Artistas, Lançamentos ou Projetos exigidos para ordenar os quatro destaques e abrir o modal 360°. Streams desconhecidos permanecem indisponíveis em vez de serem exibidos como zero."/></div></section>

      <footer className="dashboard-reference-foot"><RefreshCw size={14}/><span>{dashboard?.generated_at?`Dados agregados em ${new Date(dashboard.generated_at).toLocaleString('pt-BR')}`:'Aguardando fonte operacional real'}</span></footer>
    </section>
  </AdminShell>
}
