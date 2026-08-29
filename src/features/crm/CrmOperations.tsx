import { BriefcaseBusiness, CalendarDays, CircleDollarSign, Megaphone, TrendingUp, Users } from 'lucide-react'
import { AdminKpi, AdminNotice, AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { ADMIN_CAPABILITIES } from '../../shared/internal/adminCapabilities'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { formatCurrency } from './model'
import { crmReadModel } from './repository'

const demoDescription='Esta visualização ainda não está conectada a uma fonte persistente. Os números servem para validar a estrutura operacional do CRM.'
const campaigns = [
  ['Portal Lander Institucional','Ativa','Meta + Google','R$ 4.800','148 leads'],
  ['Mídia Kit Comercial','Planejada','Meta','R$ 2.000','—'],
  ['Captação Parceiros','Ativa','Google','R$ 3.200','63 leads'],
]

export function CampaignsPage(){return <AdminShell area="crm" items={CRM_NAV}><AdminPageHeader eyebrow="CRM / Campanhas" title="Campanhas" description="Acompanhe iniciativas comerciais, investimento, canais e geração de oportunidades." action="Nova campanha" disabled disabledReason={ADMIN_CAPABILITIES.crmPersistence.description}/><AdminNotice title="Dados de demonstração" description={demoDescription}/><div className="admin-kpi-grid"><AdminKpi label="Ativas" value="2" detail="Campanhas demonstrativas" icon={<Megaphone size={16}/>}/><AdminKpi label="Planejadas" value="1" detail="Campanhas demonstrativas" icon={<CalendarDays size={16}/>}/><AdminKpi label="Investimento" value="R$ 8 mil" detail="Orçamento demonstrativo" icon={<CircleDollarSign size={16}/>}/><AdminKpi label="Leads" value="211" detail="Atribuição demonstrativa" icon={<Users size={16}/>}/></div><section className="table-card"><table><thead><tr><th>Campanha</th><th>Status</th><th>Canais</th><th>Orçamento</th><th>Resultado</th></tr></thead><tbody>{campaigns.map(([name,status,channels,budget,result])=><tr key={name}><td><strong>{name}</strong></td><td><span className="status">{status}</span></td><td>{channels}</td><td>{budget}</td><td>{result}</td></tr>)}</tbody></table></section></AdminShell>}

export function ReportsPage(){
  const closed=crmReadModel.deals.filter(deal=>deal.stage==='Fechado')
  const averageTicket=closed.length?closed.reduce((sum,deal)=>sum+deal.value,0)/closed.length:0
  return <AdminShell area="crm" items={CRM_NAV}><AdminPageHeader eyebrow="CRM / Relatórios" title="Relatórios" description="Leitura executiva da operação comercial e dos principais indicadores do funil."/><AdminNotice title="Dados de demonstração" description={demoDescription}/><div className="admin-kpi-grid"><AdminKpi label="Negócios" value={String(crmReadModel.deals.length)} detail="Snapshot demonstrativo" icon={<TrendingUp size={16}/>}/><AdminKpi label="Ticket fechado" value={formatCurrency(averageTicket)} detail="Média dos fechados" icon={<CircleDollarSign size={16}/>}/><AdminKpi label="Pipeline" value={formatCurrency(crmReadModel.metrics.pipelineValue)} detail="Snapshot demonstrativo" icon={<BriefcaseBusiness size={16}/>}/><AdminKpi label="Atividades" value={String(crmReadModel.activities.length)} detail="Agenda demonstrativa" icon={<CalendarDays size={16}/>}/></div><div className="admin-grid"><section className="admin-card"><div className="admin-card-head"><div><span>Funil</span><h2>Distribuição comercial</h2></div></div><div className="report-bars"><div><span>Contatos</span><b style={{width:'100%'}}/></div><div><span>Leads</span><b style={{width:'64%'}}/></div><div><span>Propostas</span><b style={{width:'41%'}}/></div><div><span>Clientes</span><b style={{width:'18%'}}/></div></div></section><section className="admin-card"><div className="admin-card-head"><div><span>Leitura</span><h2>Indicadores prioritários</h2></div></div><p>Esta visão está pronta para receber conversão, receita, ciclo de venda, origem de leads e performance por responsável assim que uma fonte persistente for conectada.</p></section></div></AdminShell>
}

export function FinancePage(){
  const openDeals=crmReadModel.deals.filter(deal=>deal.stage!=='Fechado')
  const closedDeals=crmReadModel.deals.filter(deal=>deal.stage==='Fechado')
  const openValue=openDeals.reduce((sum,deal)=>sum+deal.value,0)
  const closedValue=closedDeals.reduce((sum,deal)=>sum+deal.value,0)
  return <AdminShell area="crm" items={CRM_NAV}><AdminPageHeader eyebrow="CRM / Financeiro" title="Financeiro" description="Visão comercial de valores relacionados às oportunidades do snapshot atual."/><AdminNotice title="Dados de demonstração" description={demoDescription}/><div className="admin-kpi-grid"><AdminKpi label="Em aberto" value={formatCurrency(openValue)} detail="Negócios não fechados" icon={<TrendingUp size={16}/>}/><AdminKpi label="Fechado" value={formatCurrency(closedValue)} detail="Negócios fechados" icon={<BriefcaseBusiness size={16}/>}/><AdminKpi label="Total relacionado" value={formatCurrency(openValue+closedValue)} detail="Snapshot demonstrativo" icon={<CircleDollarSign size={16}/>}/><AdminKpi label="Negócios" value={String(crmReadModel.deals.length)} detail="Registros demonstrativos" icon={<CalendarDays size={16}/>}/></div><section className="table-card"><table><thead><tr><th>Referência</th><th>Empresa</th><th>Etapa</th><th>Valor</th></tr></thead><tbody>{crmReadModel.deals.map(deal=><tr key={deal.id}><td>{deal.title}</td><td>{deal.company}</td><td><span className="status">{deal.stage}</span></td><td><strong>{formatCurrency(deal.value)}</strong></td></tr>)}</tbody></table></section></AdminShell>
}
