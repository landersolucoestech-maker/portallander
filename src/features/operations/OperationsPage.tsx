import {
  AlertCircle,
  BarChart3,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileEdit,
  FileSignature,
  FileStack,
  Folder,
  Gauge,
  Headphones,
  Link2,
  ListChecks,
  Megaphone,
  MessageSquareText,
  MoreHorizontal,
  Palmtree,
  PenLine,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminPageHeader, AdminShell } from '../../shared/internal/AdminUi'
import { operationsModuleByKey } from './modules'

const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value)
type Tone='neutral'|'success'|'warning'|'danger'|'accent'|'info'

function Metric({title,value,description,icon,tone='neutral'}:{title:string;value:string|number;description:string;icon:ReactNode;tone?:Tone}){
  return <article className={`zip-metric zip-metric-${tone}`}><div className="zip-metric-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{description}</small></div></article>
}
function Badge({children,tone='neutral'}:{children:ReactNode;tone?:Tone}){return <span className={`zip-badge zip-badge-${tone}`}>{children}</span>}
function Toolbar({children}:{children:ReactNode}){return <div className="zip-toolbar">{children}</div>}
function SearchField({placeholder}:{placeholder:string}){return <label className="zip-search"><Search size={14}/><input placeholder={placeholder}/></label>}
function Panel({title,description,children,action}:{title:string;description?:string;children:ReactNode;action?:ReactNode}){
  return <section className="zip-panel"><header className="zip-panel-head"><div><h2>{title}</h2>{description&&<p>{description}</p>}</div>{action}</header>{children}</section>
}
function DataTable({headers,rows}:{headers:string[];rows:ReactNode[][]}){
  return <div className="zip-table-wrap"><table className="zip-table"><thead><tr>{headers.map((h,i)=><th key={h} className={i===headers.length-1?'right':''}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} className={j===row.length-1?'right':''}>{cell}</td>)}</tr>)}</tbody></table></div>
}

function AccountingPage(){
  const [tab,setTab]=useState('todos')
  const revenue=20500,expenses=5680,profit=14820
  const rows=[
    ['Publicidade Portal Lander','Receita','Recebido',8500],
    ['Cobertura Festival Órbita','Receita','Previsto',12000],
    ['Ferramentas SaaS','Despesa','Pago',-2480],
    ['Produção editorial','Despesa','Pago',-3200],
  ] as const
  return <div className="zip-stack">
    <Toolbar><input type="date"/><input type="date"/><SearchField placeholder="Buscar por descrição ou categoria…"/><select><option>Todos</option><option>Receitas</option><option>Despesas</option><option>Lucro</option></select></Toolbar>
    <div className="zip-kpi-grid four">
      <Metric title="Receita Total" value={money(revenue)} description="receitas no período" icon={<TrendingUp size={18}/>} tone="success"/>
      <Metric title="Despesa Total" value={money(expenses)} description="despesas no período" icon={<TrendingDown size={18}/>} tone="danger"/>
      <Metric title="Lucro Líquido" value={money(profit)} description="resultado consolidado" icon={<CircleDollarSign size={18}/>} tone="accent"/>
      <Metric title="Margem Líquida" value="72%" description="resultado sobre receita" icon={<Gauge size={18}/>} tone="success"/>
    </div>
    <div className="zip-segmented four">{[['todos','Todos'],['empresa','P&L Empresa'],['projetos','P&L Projetos'],['artistas','P&L Artistas']].map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</div>
    {(tab==='todos'||tab==='empresa')&&<Panel title="P&L Empresa" description="Demonstrativo de receitas, despesas e resultado da operação">
      <DataTable headers={['Descrição','Tipo','Status','Valor']} rows={rows.map(r=>[<strong>{r[0]}</strong>,r[1],<Badge tone={r[2]==='Previsto'?'warning':'success'}>{r[2]}</Badge>,<strong className={r[3]>0?'zip-positive':'zip-negative'}>{money(r[3])}</strong>])}/>
    </Panel>}
    {(tab==='todos'||tab==='projetos')&&<Panel title="P&L por Projeto" description="Resultado por lançamento e operação"><DataTable headers={['Projeto','Categoria','Receitas','Despesas','Resultado']} rows={[
      [<strong>Portal Lander Institucional</strong>,'Marketing',money(8500),money(2100),<strong className="zip-positive">{money(6400)}</strong>],
      [<strong>Festival Órbita</strong>,'Cobertura',money(12000),money(3200),<strong className="zip-positive">{money(8800)}</strong>],
    ]}/></Panel>}
    {(tab==='todos'||tab==='artistas')&&<Panel title="P&L por Relacionamento" description="Visão financeira por parceiro, anunciante ou artista"><DataTable headers={['Relacionamento','Receitas','Despesas','Resultado']} rows={[
      [<strong>Norte Produções</strong>,money(8500),money(1500),<strong className="zip-positive">{money(7000)}</strong>],
      [<strong>Festival Órbita</strong>,money(12000),money(3200),<strong className="zip-positive">{money(8800)}</strong>],
    ]}/></Panel>}
  </div>
}

function ContractsPage(){
  const rows=[
    ['Pacote de mídia · Norte Produções','Publicidade','Em assinatura','Autentique','R$ 18.000'],
    ['Cobertura · Festival Órbita','Evento','Rascunho','—','R$ 12.000'],
    ['Parceria · Studio Sul','Parceria','Vigente','Clicksign','R$ 9.000'],
    ['Publieditorial · Agência Ponto','Publicidade','Em análise','—','R$ 15.000'],
  ]
  return <div className="zip-stack">
    <div className="zip-page-actions"><button className="zip-button secondary"><FileStack size={14}/> Templates</button><button className="zip-button" disabled><Plus size={14}/> Novo Contrato</button></div>
    <div className="zip-kpi-grid contracts">
      <Metric title="Total de Contratos" value="12" description="na base" icon={<FileStack size={18}/>} tone="accent"/>
      <Metric title="Vigentes" value="7" description="em vigor" icon={<CheckCircle2 size={18}/>} tone="success"/>
      <Metric title="Assinados" value="2" description="aguardando vigência" icon={<PenLine size={18}/>} tone="accent"/>
      <Metric title="Aguardando Assinatura" value="3" description="pendentes de assinar" icon={<CalendarClock size={18}/>} tone="warning"/>
      <Metric title="Em Análise" value="2" description="rascunho / negociação" icon={<FileEdit size={18}/>} />
      <Metric title="Encerrados" value="1" description="expirados / cancelados" icon={<AlertCircle size={18}/>} tone="warning"/>
      <Metric title="Valor Total" value="R$ 54.000" description="vigentes + assinados" icon={<CircleDollarSign size={18}/>} tone="accent"/>
    </div>
    <Toolbar><SearchField placeholder="Buscar por parceiro, tipo ou título…"/><select><option>Todos os tipos</option></select><select><option>Todos os status</option></select></Toolbar>
    <Panel title="Contratos" description="Documentos, status, assinatura e valor">
      <DataTable headers={['Contrato','Tipo','Status','Assinatura','Valor']} rows={rows.map(r=>[<strong>{r[0]}</strong>,r[1],<Badge tone={r[2]==='Vigente'?'success':r[2]==='Rascunho'?'neutral':'warning'}>{r[2]}</Badge>,r[3],<strong>{r[4]}</strong>])}/>
    </Panel>
  </div>
}

function AgendaPage(){
  const events=[['10:30','Follow-up Norte Produções','Comercial'],['14:00','Entrevista Mariana Santos','Editorial'],['15:00','Revisão Festival Órbita','Cobertura'],['16:30','Reunião Agência Ponto','Comercial']]
  return <div className="zip-stack">
    <div className="zip-kpi-grid four"><Metric title="Eventos" value="18" description="no total" icon={<CalendarDays size={18}/>} tone="accent"/><Metric title="Confirmados" value="11" description="eventos confirmados" icon={<CheckCircle2 size={18}/>} tone="success"/><Metric title="Pendentes" value="4" description="aguardando confirmação" icon={<CalendarClock size={18}/>} tone="warning"/><Metric title="Próximos 7 dias" value="6" description="na próxima semana" icon={<CalendarDays size={18}/>} tone="accent"/></div>
    <Toolbar><button className="zip-button secondary">Hoje</button><button className="zip-icon"><ChevronLeft size={15}/></button><button className="zip-icon"><ChevronRight size={15}/></button><strong className="zip-period">Agosto — Setembro 2026</strong><SearchField placeholder="Buscar eventos…"/><select><option>Mês</option><option>Semana</option></select><button className="zip-button" disabled><Plus size={14}/> Novo Evento</button></Toolbar>
    <div className="zip-calendar-layout"><div className="zip-calendar"><div className="zip-calendar-head">{['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map(d=><span key={d}>{d}</span>)}</div><div className="zip-calendar-grid">{Array.from({length:35},(_,i)=><div key={i} className={i===29?'today':''}><span>{i<2?30+i:i-1}</span>{[3,10,17,24].includes(i)&&<b>Follow-up</b>}{[5,12,19].includes(i)&&<em>Editorial</em>}</div>)}</div></div><aside className="zip-agenda"><header><span>PRÓXIMOS</span><h3>Agenda</h3></header>{events.map(e=><article key={e[0]}><time>{e[0]}</time><div><strong>{e[1]}</strong><small>{e[2]}</small></div></article>)}</aside></div>
  </div>
}

function IntegrationsPage(){
  const providers=[['Meta','Instagram, Facebook, mensagens, conteúdo e anúncios','OAuth oficial'],['WhatsApp','Atendimento e mensagens','Meta Cloud API'],['Resend','E-mail transacional e operacional','API Key'],['Autentique','Assinatura eletrônica','API oficial'],['NFS-e','Emissão e consulta fiscal','Provedor fiscal'],['Google Ads','Campanhas e métricas','OAuth oficial'],['YouTube','Conteúdo e campanhas','OAuth oficial'],['TikTok','Conteúdo, mensagens e anúncios','OAuth oficial']]
  return <div className="zip-stack"><div className="zip-integration-summary"><div><span>INTEGRAÇÕES</span><h2>Provedores e serviços</h2><p>Conexões oficiais da operação do Portal Lander.</p></div><div><strong>0</strong><small>de 8 conectadas</small></div></div><div className="zip-provider-grid">{providers.map(([name,desc,auth])=><article key={name} className="zip-provider"><header><div>{name.slice(0,2).toUpperCase()}</div><Badge>Não conectado</Badge></header><h3>{name}</h3><p>{desc}</p><footer><span>{auth}</span><button disabled>Configurar</button></footer></article>)}</div></div>
}

const marketingCopy={
  'visao-geral':['Marketing','Visão geral das iniciativas, campanhas e execução do setor.'],
  briefing:['Marketing · Briefing','Estratégia, público, objetivos, mensagens e entregáveis.'],
  calendario:['Marketing · Calendário','Planejamento de publicações, campanhas e entregas.'],
  campanhas:['Marketing · Campanhas','Campanhas, canais, orçamento, status e desempenho.'],
  'ia-criativa':['IA Criativa','Criação, perfil, pitching, tendências, métricas e histórico.'],
  metricas:['Métricas','Performance de marketing por plataforma.'],
  tarefas:['Marketing · Tarefas','Núcleo operacional de tarefas.'],
} as const
export type MarketingSectionKey=keyof typeof marketingCopy

function MarketingOverview(){return <div className="zip-stack">
  <div className="zip-kpi-grid eight">
    <Metric title="Campanhas ativas" value="2" description="em execução" icon={<Megaphone size={18}/>} tone="accent"/>
    <Metric title="Projetos em divulgação" value="3" description="operações ativas" icon={<Folder size={18}/>} tone="accent"/>
    <Metric title="Conteúdos programados" value="12" description="aguardando publicação" icon={<CalendarClock size={18}/>} tone="warning"/>
    <Metric title="Tarefas pendentes" value="9" description="demandas abertas" icon={<ListChecks size={18}/>} tone="warning"/>
    <Metric title="Conteúdos publicados" value="18" description="no período" icon={<FileEdit size={18}/>} tone="accent"/>
    <Metric title="Aprovações pendentes" value="4" description="aguardando revisão" icon={<CheckCircle2 size={18}/>} tone="danger"/>
    <Metric title="Entregas próximas" value="6" description="próximos prazos" icon={<Truck size={18}/>} tone="accent"/>
    <Metric title="Performance do setor" value="78%" description="snapshot" icon={<Gauge size={18}/>} tone="success"/>
  </div>
  <div className="zip-overview-grid"><Panel title="Campanhas em andamento" description="Acompanhamento rápido dos projetos"><div className="zip-list">{[['Portal Lander Institucional','Ativa','78%'],['Mídia Kit Comercial','Planejada','42%'],['Festival Órbita','Ativa','63%']].map(r=><article key={r[0]}><div><strong>{r[0]}</strong><Badge tone={r[1]==='Ativa'?'success':'warning'}>{r[1]}</Badge></div><div className="zip-progress"><b style={{width:r[2]}}/></div><small>{r[2]} concluído</small></article>)}</div></Panel><div className="zip-side-stack"><Panel title="Atalhos rápidos"><div className="zip-shortcuts">{['Novo briefing','Nova campanha','Adicionar conteúdo','Criar tarefa'].map((x,i)=><button key={x} disabled>{i===0?<Sparkles size={15}/>:<Plus size={15}/>}<span>{x}</span></button>)}</div></Panel><Panel title="Atividades recentes"><div className="zip-activity">{['Mídia Kit Comercial atualizado','Campanha institucional revisada','Calendário de setembro preparado'].map((x,i)=><div key={x}><span>{i+1}</span><p><strong>{x}</strong><small>{i+1}h atrás</small></p></div>)}</div></Panel></div></div>
</div>}
function MarketingBriefing(){return <div className="zip-stack"><div className="zip-kpi-grid four"><Metric title="Briefings" value="4" description="cadastrados" icon={<ClipboardList size={18}/>} tone="accent"/><Metric title="Em elaboração" value="2" description="rascunhos" icon={<FileEdit size={18}/>} tone="warning"/><Metric title="Aprovados" value="1" description="prontos para execução" icon={<CheckCircle2 size={18}/>} tone="success"/><Metric title="Entregáveis" value="14" description="itens previstos" icon={<Folder size={18}/>} tone="accent"/></div><Toolbar><SearchField placeholder="Buscar por nome ou objetivo…"/><select><option>Todos os status</option></select><button className="zip-button" disabled><Plus size={14}/> Novo Briefing</button></Toolbar><Panel title="Briefings" description="Estratégia, contexto, público e entregáveis"><DataTable headers={['Briefing','Objetivo','Público','Status','Entregáveis']} rows={[[<strong>Festival Órbita 2026</strong>,'Cobertura e awareness','Público urbano 18–34',<Badge tone="success">Aprovado</Badge>,'6'],[<strong>Mídia Kit Comercial</strong>,'Captação de anunciantes','Marcas e agências',<Badge tone="warning">Em elaboração</Badge>,'4'],[<strong>Portal Lander Institucional</strong>,'Fortalecimento de marca','Mercado da música',<Badge>Rascunho</Badge>,'4']]}/></Panel></div>}
function MarketingCalendar(){return <div className="zip-stack"><div className="zip-kpi-grid four"><Metric title="Conteúdos" value="24" description="no total" icon={<CalendarDays size={18}/>} tone="accent"/><Metric title="Agendados" value="9" description="aguardando publicação" icon={<CalendarClock size={18}/>} tone="warning"/><Metric title="Publicados" value="11" description="conteúdos publicados" icon={<CheckCircle2 size={18}/>} tone="success"/><Metric title="Próximos 7 dias" value="6" description="na próxima semana" icon={<CalendarClock size={18}/>} tone="accent"/></div><Toolbar><button className="zip-button secondary">Hoje</button><button className="zip-icon"><ChevronLeft size={15}/></button><button className="zip-icon"><ChevronRight size={15}/></button><strong className="zip-period">Setembro 2026</strong><select><option>Mês</option></select><button className="zip-button" disabled><Plus size={14}/> Novo conteúdo</button></Toolbar><div className="zip-calendar"><div className="zip-calendar-head">{['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map(d=><span key={d}>{d}</span>)}</div><div className="zip-calendar-grid">{Array.from({length:35},(_,i)=><div key={i}><span>{i+1}</span>{[2,8,14,20,26].includes(i)&&<b>Campanha</b>}{[5,11,17,23].includes(i)&&<em>Conteúdo</em>}</div>)}</div></div></div>}
function MarketingCampaigns(){return <div className="zip-stack"><div className="zip-kpi-grid five"><Metric title="Total de Campanhas" value="8" description="na base" icon={<Megaphone size={18}/>} tone="accent"/><Metric title="Ativas" value="2" description="em execução" icon={<CheckCircle2 size={18}/>} tone="success"/><Metric title="Planejadas" value="3" description="aguardando início" icon={<CalendarClock size={18}/>} tone="warning"/><Metric title="Investimento" value="R$ 18.400" description="orçamento alocado" icon={<CircleDollarSign size={18}/>} tone="accent"/><Metric title="CTR médio" value="3,7%" description="taxa de clique" icon={<BarChart3 size={18}/>} tone="success"/></div><Toolbar><SearchField placeholder="Buscar por nome ou descrição…"/><select><option>Todos os status</option></select><select><option>Todos os tipos</option></select><button className="zip-button" disabled><Plus size={14}/> Nova Campanha</button></Toolbar><Panel title="Campanhas" description="Canais, objetivo, orçamento e desempenho"><DataTable headers={['Campanha','Canal','Status','Objetivo','Orçamento','Desempenho']} rows={[[<strong>Portal Lander Institucional</strong>,'Meta + Google',<Badge tone="success">Ativa</Badge>,'Aquisição','R$ 8.000','78%'],[<strong>Mídia Kit Comercial</strong>,'Meta',<Badge tone="warning">Planejada</Badge>,'Anunciantes','R$ 5.400','42%'],[<strong>Festival Órbita</strong>,'Instagram',<Badge tone="success">Ativa</Badge>,'Cobertura','R$ 5.000','63%']]}/></Panel></div>}
function MarketingCreative(){const [tab,setTab]=useState('ideias');return <div className="zip-stack"><div className="zip-workspace-hero"><div><span>IA CRIATIVA</span><h2>Workspace criativo</h2><p>Perfil, ideias, pitching, tendências, planejamento, analytics e histórico.</p></div><Sparkles size={30}/></div><div className="zip-segmented creative">{['perfil','ideias','pitching','tendencias','planejamento','analytics','historico'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div><div className="zip-creative-grid"><Panel title={tab==='ideias'?'Ideias geradas':`IA Criativa · ${tab}`} description="Área demonstrativa inspirada no workspace do módulo de referência"><div className="zip-idea-list">{['Conceito de campanha editorial','Roteiro curto para social','Ângulo de pitching para imprensa','Variação de CTA comercial'].map(x=><article key={x}><Sparkles size={16}/><div><strong>{x}</strong><small>Contexto do Portal Lander</small></div></article>)}</div></Panel><Panel title="Contexto usado"><dl className="zip-definition"><div><dt>Marca</dt><dd>Portal Lander</dd></div><div><dt>Objetivo</dt><dd>Aquisição e autoridade</dd></div><div><dt>Tom</dt><dd>Editorial e profissional</dd></div><div><dt>Status</dt><dd><Badge>Sem IA conectada</Badge></dd></div></dl></Panel></div></div>}
function MarketingMetrics(){return <div className="zip-stack"><Toolbar><select><option>Todas as plataformas</option></select><select><option>Últimos 30 dias</option></select><SearchField placeholder="Buscar campanha…"/></Toolbar><div className="zip-kpi-grid six"><Metric title="Impressões" value="128 mil" description="alcance bruto" icon={<BarChart3 size={18}/>} tone="accent"/><Metric title="Alcance" value="91 mil" description="pessoas" icon={<Users size={18}/>} tone="accent"/><Metric title="Cliques" value="9.420" description="tráfego" icon={<TrendingUp size={18}/>} tone="success"/><Metric title="CTR" value="3,7%" description="média" icon={<Gauge size={18}/>} tone="success"/><Metric title="Leads" value="211" description="atribuídos" icon={<UserPlus size={18}/>} tone="accent"/><Metric title="Conversão" value="18%" description="snapshot" icon={<CheckCircle2 size={18}/>} tone="success"/></div><div className="zip-report-grid"><Panel title="Performance por plataforma" description="Leitura rápida dos principais indicadores"><div className="zip-bars">{[['Instagram',88],['Meta Ads',73],['Google Ads',62],['TikTok',49],['YouTube',41]].map(r=><div key={r[0]}><span>{r[0]}</span><div><b style={{width:`${r[1]}%`}}/></div><strong>{r[1]}%</strong></div>)}</div></Panel><Panel title="Top campanhas" description="Ranking por desempenho"><DataTable headers={['Campanha','Canal','CTR']} rows={[[<strong>Portal Lander</strong>,'Meta','4,8%'],[<strong>Festival Órbita</strong>,'Instagram','4,2%'],[<strong>Mídia Kit</strong>,'Google','3,1%']]}/></Panel></div></div>}
function MarketingTasks(){return <div className="zip-stack"><div className="zip-kpi-grid five"><Metric title="Total de Tarefas" value="18" description="demandas cadastradas" icon={<ListChecks size={18}/>} tone="accent"/><Metric title="Concluídas" value="7" description="finalizadas" icon={<CheckCircle2 size={18}/>} tone="success"/><Metric title="A Fazer" value="5" description="backlog" icon={<CalendarClock size={18}/>} tone="info"/><Metric title="Em Andamento" value="4" description="em execução" icon={<MoreHorizontal size={18}/>} tone="warning"/><Metric title="Revisão" value="2" description="em revisão" icon={<AlertCircle size={18}/>} tone="danger"/></div><Toolbar><SearchField placeholder="Buscar tarefa…"/><select><option>Todos os tipos</option></select><button className="zip-button" disabled><Plus size={14}/> Nova Tarefa</button></Toolbar><Panel title="Lista de Tarefas" description="Acompanhe tipos, responsáveis, prazos e status"><DataTable headers={['Tarefa','Tipo','Responsável','Prazo','Status']} rows={[[<strong>Fechar mídia kit setembro</strong>,'Comercial','Marketing','30/08',<Badge tone="warning">Em andamento</Badge>],[<strong>Revisar peças Festival Órbita</strong>,'Criativo','Editorial','31/08',<Badge tone="danger">Revisão</Badge>],[<strong>Programar posts da semana</strong>,'Conteúdo','Social','01/09',<Badge>A fazer</Badge>]]}/></Panel></div>}

function ChatSurface({internal}:{internal:boolean}){
  const items=internal?[['Cobertura Festival Órbita','Editorial + Comercial','Agora'],['Mídia Kit 2026','Comercial + Marketing','12 min'],['Pautas da semana','Editorial','28 min']]:[['Marina Costa','WhatsApp · Comercial','2 min'],['Aline Moreira','Instagram · Editorial','8 min'],['Festival Órbita','WhatsApp · Cobertura','15 min']]
  return <div className={`zip-chat ${internal?'internal':''}`}><aside className="zip-chat-list"><div className="zip-chat-list-head"><div><span>{internal?'CONVERSAS':'INBOX'}</span><h3>{internal?'Chat Interno':'Central de Atendimento'}</h3></div><button className="zip-icon" disabled><Plus size={15}/></button></div><SearchField placeholder="Buscar conversa…"/><div className="zip-chat-filters"><button className="active">Todos</button><button>{internal?'Não lidas':'Aguardando'}</button><button>{internal?'Equipe':'Em atendimento'}</button></div>{items.map((r,i)=><button className={`zip-conversation ${i===0?'active':''}`} key={r[0]}><span className="zip-avatar">{r[0].slice(0,2).toUpperCase()}</span><div><strong>{r[0]}</strong><small>{r[1]}</small></div><time>{r[2]}</time></button>)}</aside><main className="zip-chat-main"><header><span className="zip-avatar">{items[0][0].slice(0,2).toUpperCase()}</span><div><strong>{items[0][0]}</strong><small>{items[0][1]}</small></div><MoreHorizontal size={16}/></header><div className="zip-messages"><div className="in">Olá! Gostaria de alinhar os próximos passos.</div><div className="out">Perfeito. Vou organizar as informações e seguimos por aqui.</div><div className="in">Ótimo, obrigado!</div></div><footer><input placeholder="Responder…" disabled/><button disabled>Enviar</button></footer></main>{!internal&&<aside className="zip-chat-context"><header><span>CONTEXTO</span><h3>Relacionamento</h3></header><dl><div><dt>Status</dt><dd><Badge tone="warning">Qualificado</Badge></dd></div><div><dt>Responsável</dt><dd>Comercial</dd></div><div><dt>Origem</dt><dd>Anuncie Aqui</dd></div><div><dt>Interesse</dt><dd>Publicidade</dd></div></dl></aside>}</div>
}
export function ChatPage(){const [tab,setTab]=useState<'internal'|'support'>('internal');return <AdminShell area="crm" items={CRM_NAV}><AdminPageHeader eyebrow="CRM / CHAT" title="Chat" description="Chat interno e central multicanal de atendimento."/><div className="zip-stack chat-page"><div className="zip-tabs compact"><button className={tab==='internal'?'active':''} onClick={()=>setTab('internal')}><Users size={15}/> Chat Interno</button><button className={tab==='support'?'active':''} onClick={()=>setTab('support')}><Headphones size={15}/> Central de Atendimento</button></div>{tab==='internal'?<ChatSurface internal/>:<ChatSurface internal={false}/>}</div></AdminShell>}

function ReportsPage(){return <div className="zip-stack"><Toolbar><select><option>Últimos 30 dias</option></select><select><option>Todos os módulos</option></select><SearchField placeholder="Buscar relatório…"/><button className="zip-button secondary" disabled>Exportar</button></Toolbar><div className="zip-kpi-grid four"><Metric title="Relatórios" value="7" description="visões preparadas" icon={<BarChart3 size={18}/>} tone="accent"/><Metric title="Fontes" value="5" description="módulos relacionados" icon={<Link2 size={18}/>} tone="accent"/><Metric title="Atualização" value="Manual" description="sem backend analítico" icon={<Settings size={18}/>}/><Metric title="Exportações" value="0" description="integração futura" icon={<ChevronRight size={18}/>} /></div><div className="zip-report-grid"><Panel title="Aquisição e conversão" description="Leads por origem"><div className="zip-bars">{[['Anuncie Aqui',84],['Instagram',62],['Indicação',48],['Site',35],['Meta Ads',28]].map(r=><div key={r[0]}><span>{r[0]}</span><div><b style={{width:`${r[1]}%`}}/></div><strong>{r[1]}</strong></div>)}</div></Panel><Panel title="Relatórios disponíveis"><div className="zip-report-list">{['Aquisição e conversão','Publicidade e receita','Conteúdo e relacionamentos','Campanhas de marketing','Atendimento e SLA'].map(x=><button key={x}><BarChart3 size={15}/><span>{x}</span><ChevronRight size={14}/></button>)}</div></Panel></div></div>}

function RhPage(){const [tab,setTab]=useState('funcionarios');return <div className="zip-stack"><div className="zip-kpi-grid four"><Metric title="Total" value="8" description="colaboradores" icon={<Users size={18}/>} tone="accent"/><Metric title="Ativos" value="8" description="vínculos ativos" icon={<UserCheck size={18}/>} tone="success"/><Metric title="Férias" value="1" description="no período" icon={<Palmtree size={18}/>} tone="info"/><Metric title="Afastados" value="0" description="no período" icon={<AlertCircle size={18}/>} tone="warning"/></div><div className="zip-tabs">{[['funcionarios','Funcionários'],['folha','Folha de Pagamento'],['ferias','Férias e Ausências'],['documentos','Documentos']].map(([k,l])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}>{l}</button>)}</div><Toolbar><SearchField placeholder={tab==='funcionarios'?'Buscar por nome, email, cargo, CPF…':'Buscar registros…'}/><select><option>Todos os status</option></select><select><option>Todos os setores</option></select><button className="zip-button" disabled><Plus size={14}/> Novo registro</button></Toolbar><Panel title={tab==='funcionarios'?'Funcionários e colaboradores':tab==='folha'?'Folha de Pagamento':tab==='ferias'?'Férias e Ausências':'Documentos'}><DataTable headers={['Nome / Equipe','Área','Vínculo','Status','Referência']} rows={[[<strong>Equipe Editorial</strong>,'Editorial','Colaborador',<Badge tone="success">Ativo</Badge>,'3 pessoas'],[<strong>Equipe Comercial</strong>,'Comercial','Colaborador',<Badge tone="success">Ativo</Badge>,'2 pessoas'],[<strong>Administração</strong>,'Operação','Administrativo',<Badge tone="success">Ativo</Badge>,'3 pessoas']]}/></Panel></div>}

function SettingsPage(){const [tab,setTab]=useState('geral');return <div className="zip-stack"><div className="zip-tabs">{[['geral','Geral'],['perfil','Meu Perfil'],['integracoes','Integrações'],['usuarios','Usuários'],['auditoria','Audit Trail']].map(([k,l])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}>{l}</button>)}</div>{tab==='geral'&&<div className="zip-settings-grid"><Panel title="Identidade da empresa"><div className="zip-form"><label><span>Nome</span><input value="Portal Lander" readOnly/></label><label><span>E-mail administrativo</span><input value="admin@portallander.com" readOnly/></label><label className="wide"><span>Descrição</span><textarea value="Operação editorial, comercial e administrativa do Portal Lander." readOnly/></label></div></Panel><Panel title="Preferências operacionais"><div className="zip-setting-list">{[['Notificações','Alertas e avisos internos'],['Cadastro público','Fluxos externos de colaboração'],['Auditoria','Histórico de operações críticas']].map(r=><div key={r[0]}><div><strong>{r[0]}</strong><small>{r[1]}</small></div><span/></div>)}</div></Panel></div>}{tab==='perfil'&&<div className="zip-profile-layout"><aside><div className="zip-profile-avatar">PL</div><h2>Administrador local</h2><p>Sem autenticação server-side</p><Badge>Ambiente de desenvolvimento</Badge></aside><Panel title="Informações pessoais"><div className="zip-form"><label><span>Nome</span><input value="Administrador local" readOnly/></label><label><span>E-mail</span><input value="admin@portallander.com" readOnly/></label><label><span>Função</span><input value="Administrador" readOnly/></label><label><span>Telefone</span><input value="—" readOnly/></label></div></Panel></div>}{tab==='integracoes'&&<IntegrationsPage/>}{tab==='usuarios'&&<Panel title="Usuários e papéis"><div className="zip-user-list">{[['Administrador local','Administrador','Ativo'],['Equipe Editorial','Editorial','Planejado'],['Equipe Comercial','Comercial','Planejado']].map(r=><article key={r[0]}><span className="zip-avatar">{r[0].slice(0,2).toUpperCase()}</span><div><strong>{r[0]}</strong><small>{r[1]}</small></div><Badge tone={r[2]==='Ativo'?'success':'warning'}>{r[2]}</Badge></article>)}</div></Panel>}{tab==='auditoria'&&<><div className="zip-kpi-grid four"><Metric title="Total de eventos" value="18" description="audit logs" icon={<ShieldCheck size={18}/>} tone="accent"/><Metric title="Criações" value="7" description="registros" icon={<Plus size={18}/>} tone="success"/><Metric title="Atualizações" value="9" description="modificações" icon={<Settings size={18}/>} tone="info"/><Metric title="Exclusões" value="2" description="operações destrutivas" icon={<TrendingDown size={18}/>} tone="danger"/></div><Toolbar><SearchField placeholder="Buscar evento…"/><select><option>Todas as entidades</option></select><select><option>Todas as ações</option></select><input type="date"/><input type="date"/></Toolbar></>}</div>}

export function MarketingPage(){const {sectionKey='visao-geral'}=useParams();const key=(sectionKey in marketingCopy?sectionKey:'visao-geral') as MarketingSectionKey;const [title,description]=marketingCopy[key];const content=key==='visao-geral'?<MarketingOverview/>:key==='briefing'?<MarketingBriefing/>:key==='calendario'?<MarketingCalendar/>:key==='campanhas'?<MarketingCampaigns/>:key==='ia-criativa'?<MarketingCreative/>:key==='metricas'?<MarketingMetrics/>:<MarketingTasks/>;return <AdminShell area="crm" items={CRM_NAV}><AdminPageHeader eyebrow="CRM / MARKETING" title={title} description={description}/>{content}</AdminShell>}

export function OperationsPage({moduleKey:forced}:{moduleKey?:string}){const params=useParams();const key=forced??params.moduleKey??'contracts';const module=operationsModuleByKey(key)??operationsModuleByKey('contracts')!;const content=module.key==='accounting'?<AccountingPage/>:module.key==='contracts'?<ContractsPage/>:module.key==='events'?<AgendaPage/>:module.key==='integrations'?<IntegrationsPage/>:module.key==='reports'?<ReportsPage/>:module.key==='rh'?<RhPage/>:module.key==='settings'?<SettingsPage/>:<ReportsPage/>;return <AdminShell area="crm" items={CRM_NAV}><AdminPageHeader eyebrow={`CRM / ${module.eyebrow}`} title={module.title} description={module.description.replace(/backoffice/gi,'CRM')}/>{content}</AdminShell>}
