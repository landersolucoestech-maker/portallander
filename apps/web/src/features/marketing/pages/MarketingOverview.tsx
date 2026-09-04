import {CalendarDays,CheckCircle2,ClipboardList,FileEdit,Gauge,ListChecks,Megaphone,Sparkles,Target} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import type {MarketingSeed} from '../domain'
import {UPCOMING_DELIVERY_DAYS,upcomingDeliveries} from '../marketingTime'
import {Card,Kpi,Status,pct} from '../MarketingUi'

export function MarketingOverview({state}:{state:MarketingSeed}){
  const nav=useNavigate()
  const active=state.campaigns.filter(x=>x.status==='ativa').length
  const scheduled=state.contents.filter(x=>x.status==='agendado').length
  const pending=state.tasks.filter(x=>x.status!=='concluida').length
  const approvals=state.contents.filter(x=>x.approval==='pendente').length
  const published=state.contents.filter(x=>x.status==='publicado').length
  const upcoming=upcomingDeliveries(state.contents)
  const done=state.tasks.filter(x=>x.status==='concluida').length
  const performance=Math.round(pct(done,state.tasks.length))
  const upcomingPreview=upcoming.slice(0,5)
  const pendingApproval=state.contents.filter(x=>x.approval==='pendente')

  return <>
    <div className="marketing-kpis marketing-kpis-4">
      <Kpi label="Campanhas ativas" value={active} detail="em execução" icon={<Megaphone/>}/>
      <Kpi label="Campanhas em acompanhamento" value={state.campaigns.filter(x=>x.status==='ativa'||x.status==='agendada').length} detail="ativas ou agendadas" icon={<Target/>}/>
      <Kpi label="Conteúdos programados" value={scheduled} detail="total com status agendado" icon={<CalendarDays/>}/>
      <Kpi label="Tarefas pendentes" value={pending} detail="demandas ainda não concluídas" icon={<ListChecks/>}/>
      <Kpi label="Conteúdos publicados" value={published} detail="total publicado" icon={<FileEdit/>}/>
      <Kpi label="Aprovações pendentes" value={approvals} detail="conteúdos aguardando aprovação" icon={<CheckCircle2/>}/>
      <Kpi label="Entregas próximas" value={upcoming.length} detail={`hoje + próximos ${UPCOMING_DELIVERY_DAYS-1} dias`} icon={<Target/>}/>
      <Kpi label="Performance do setor" value={`${performance}%`} detail="tarefas concluídas sobre o total" icon={<Gauge/>}/>
    </div>
    <div className="marketing-overview-shell">
      <div className="marketing-overview-main">
        <Card title="Entregas próximas" description={`Conteúdos em produção, revisão ou agendados nos próximos ${UPCOMING_DELIVERY_DAYS} dias`}>
          <div className="marketing-card-action"><button type="button" onClick={()=>nav('/app/marketing/calendario')}>Ver calendário</button></div>
          <div className="marketing-stack">{upcomingPreview.length?upcomingPreview.map(x=><div className="marketing-list-row" key={x.id}><div><strong>{x.title}</strong><small>{x.channels.join(' + ')} · {new Date(`${x.publishDate}T12:00:00`).toLocaleDateString('pt-BR')} {x.publishTime}</small></div><Status value={x.status}/></div>):<p className="marketing-inline-empty">Nenhuma entrega prevista na janela atual.</p>}</div>
        </Card>
        <Card title="Aprovações pendentes" description="Conteúdos aguardando aprovação">
          <div className="marketing-stack">{pendingApproval.length?pendingApproval.map(x=><div className="marketing-list-row" key={x.id}><div><strong>{x.title}</strong><small>{x.owner}</small></div><Status value={x.approval}/></div>):<p className="marketing-inline-empty">Nenhuma aprovação pendente.</p>}</div>
        </Card>
      </div>
      <aside className="marketing-overview-side">
        <Card title="Atalhos rápidos" description="Ações operacionais">
          <div className="marketing-quick marketing-quick-column"><button type="button" onClick={()=>nav('/app/marketing/campanhas')}><Megaphone size={14}/><span>+ Nova Campanha</span></button><button type="button" onClick={()=>nav('/app/marketing/calendario')}><CalendarDays size={14}/><span>+ Novo Conteúdo</span></button><button type="button" onClick={()=>nav('/app/marketing/tarefas')}><ListChecks size={14}/><span>+ Nova Tarefa</span></button><button type="button" onClick={()=>nav('/app/marketing/ia-criativa')}><Sparkles size={14}/><span>+ IA Criativa</span></button></div>
        </Card>
        <Card title="Atividades recentes" description="Últimas movimentações">
          <div className="marketing-stack">{state.activities.length?state.activities.map(x=><div className="marketing-activity" key={x.id}><span className="marketing-activity-icon"><ClipboardList size={13}/></span><div><strong>{x.label}</strong><span>{x.detail}</span></div></div>):<p className="marketing-inline-empty">Nenhuma atividade registrada.</p>}</div>
        </Card>
      </aside>
    </div>
  </>
}
