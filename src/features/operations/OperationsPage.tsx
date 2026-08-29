import { PlugZap } from 'lucide-react'
import { CRM_NAV } from '../../shared/internal/adminNavigation'
import { AdminShell } from '../../shared/internal/AdminUi'

const providers=[
  ['Meta','Instagram, Facebook, mensagens, conteúdo e anúncios','OAuth oficial'],
  ['WhatsApp','Atendimento e mensagens','Meta Cloud API'],
  ['Resend','E-mail transacional e operacional','API Key'],
  ['Autentique','Assinatura eletrônica','API oficial'],
  ['NFS-e','Emissão e consulta fiscal','Provedor fiscal'],
  ['Google Ads','Campanhas e métricas','OAuth oficial'],
  ['YouTube','Conteúdo e campanhas','OAuth oficial'],
  ['TikTok','Conteúdo, mensagens e anúncios','OAuth oficial'],
] as const

export function OperationsPage(){
  return <AdminShell area="crm" items={CRM_NAV} header={{title:'Integrações',description:'Provedores e serviços oficiais da operação do Portal Lander.'}}>
    <div className="zip-stack">
      <div className="zip-integration-summary"><div><span>INTEGRAÇÕES</span><h2>Provedores e serviços</h2><p>Conexões oficiais da operação do Portal Lander.</p></div><div><strong>0</strong><small>de {providers.length} conectadas</small></div></div>
      <div className="zip-provider-grid">{providers.map(([name,description,auth])=><article key={name} className="zip-provider"><header><div>{name.slice(0,2).toUpperCase()}</div><span className="zip-badge">Não conectado</span></header><h3>{name}</h3><p>{description}</p><footer><span>{auth}</span><button disabled><PlugZap size={14}/> Configurar</button></footer></article>)}</div>
    </div>
  </AdminShell>
}
