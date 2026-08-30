import {AlertCircle,CheckCircle2,Clock,ExternalLink,FileText,History,Info,MailCheck,PenLine,Send,User,X} from 'lucide-react'
import {useMemo,useState} from 'react'
import {contractStatusOptions,optionLabel,signatureStatusOptions,type Contract,type ContractCategory,type ContractSigner} from '../domain'
import {formatCurrency,formatDate,formatDateTime} from '../format'
import {SendForSigningDialog} from './SendForSigningDialog'

type ViewTab='info'|'signature'|'document'|'versions'|'attachments'|'timeline'

const signerRoleLabel:Record<ContractSigner['role'],string>={contractor:'Contratante',contracted:'Contratada',legal_representative:'Representante legal',witness:'Testemunha',other:'Outro'}

export function ContractViewModal({contract,categories,onClose}:{contract:Contract;categories:ContractCategory[];onClose:()=>void}){
 const [signing,setSigning]=useState(false),[tab,setTab]=useState<ViewTab>('info')
 const category=categories.find(c=>c.id===contract.categoryId)?.name??'—'
 const contractor=contract.parties.find(p=>p.role==='contractor')
 const alreadySent=contract.signatureStatus!=='not_sent'
 const signedAt=contract.timeline.find(item=>/assinado/i.test(item.event))?.createdAt
 const expiry=useMemo(()=>{if(!contract.endDate)return null;const end=new Date(contract.endDate);const today=new Date();today.setHours(0,0,0,0);const in30=new Date(today);in30.setDate(in30.getDate()+30);if(end<today||end>in30)return null;return Math.ceil((end.getTime()-today.getTime())/86400000)},[contract.endDate])
 const tabs:Array<[ViewTab,string]>=[['info','Informações'],['signature',`Assinatura${contract.signers.length?` (${contract.signers.length})`:''}`],['document','Arquivo'],['versions',`Versões${contract.document.versions.length?` (${contract.document.versions.length})`:''}`],['attachments',`Documentos${contract.attachments.length?` (${contract.attachments.length})`:''}`],['timeline','Histórico']]
 return <>
  <div className="crm-modal-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}>
   <section className="contracts-original-dialog" role="dialog" aria-modal="true" aria-label="Visualizar contrato">
    <header className="contracts-original-header">
     <div className="contracts-original-header-row">
      <div className="contracts-original-header-icon"><FileText size={20}/></div>
      <div className="contracts-original-title-wrap">
       <h2>{contract.title}</h2>
       <div className="contracts-original-badges">
        <span className={`contracts-status status-${contract.status}`}>{optionLabel(contractStatusOptions,contract.status)}</span>
        <span className="contracts-original-outline-badge">{contract.type}</span>
        <span className="contracts-original-outline-badge">{category}</span>
        {contract.signingProvider&&<span className="contracts-original-outline-badge">{contract.signingProvider}</span>}
        {expiry!==null&&<span className="contracts-original-warning-badge"><AlertCircle size={12}/>Expira em {expiry}d</span>}
       </div>
      </div>
     </div>
     <button className="contracts-original-close" onClick={onClose} aria-label="Fechar"><X size={18}/></button>
    </header>

    <div className="contracts-original-tabs-shell">
     <nav className="contracts-original-tabs" role="tablist">{tabs.map(([key,label])=><button key={key} role="tab" aria-selected={tab===key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</nav>
     <div className="contracts-original-scroll">
      {tab==='info'&&<section className="contracts-original-tab-content contracts-original-info-tab">
       <div className="contracts-original-info-grid">
        <InfoItem label="Número / Código" value={contract.number||'—'}/>
        <InfoItem label="Cliente / Contratante" value={contractor?.name||'—'}/>
        <InfoItem label="Tipo" value={contract.type||'—'}/>
        <InfoItem label="Categoria" value={category}/>
        <InfoItem label="Início" value={formatDate(contract.startDate)}/>
        <InfoItem label="Término" value={contract.endDate?formatDate(contract.endDate):'Indeterminado'}/>
        <InfoItem label="Vigência" value={contract.duration||'—'}/>
        <InfoItem label="Valor" value={formatCurrency(contract.payment.amount,contract.payment.currency)}/>
        <InfoItem label="Forma de pagamento" value={contract.payment.method||'—'}/>
        <InfoItem label="Periodicidade" value={contract.payment.periodicity||'—'}/>
        <InfoItem label="Assinado em" value={signedAt?formatDate(signedAt):'—'}/>
       </div>
       {contract.description&&<div className="contracts-original-observations"><p className="contracts-original-field-label">Objeto</p><div>{contract.description}</div></div>}
       {contract.internalNotes&&<div className="contracts-original-observations"><p className="contracts-original-field-label">Observações internas</p><div>{contract.internalNotes}</div></div>}
       {contract.parties.length>0&&<div className="contracts-original-observations"><p className="contracts-original-field-label">Partes e representantes</p><div className="contracts-original-list">{contract.parties.map(party=><article className="contracts-original-row-card" key={party.id}><div className="contracts-original-avatar"><User size={14}/></div><div className="contracts-original-row-copy"><strong>{party.name||'Parte sem nome'}</strong><span>{party.role==='contractor'?'Contratante':party.role==='contracted'?'Contratada':'Outra parte'} · {party.entityType==='company'?'Pessoa Jurídica':'Pessoa Física'}</span>{party.representativeName&&<span>Representante: {party.representativeName}{party.representativeRole?` · ${party.representativeRole}`:''}</span>}</div></article>)}</div></div>}
       {contract.signingProvider&&<div className="contracts-original-signing-note"><Info size={16}/><span>Assinado digitalmente via <strong>{contract.signingProvider}</strong>{contract.document.externalId&&<> — ID: <code>{contract.document.externalId}</code></>}</span></div>}
      </section>}

      {tab==='signature'&&<section className="contracts-original-tab-content contracts-original-signature-tab">
       {contract.signers.length>0?<div>
        <p className="contracts-original-section-title">Signatários ({contract.signers.length})</p>
        <div className="contracts-original-list">{[...contract.signers].sort((a,b)=>a.order-b.order).map(signer=><article className="contracts-original-row-card" key={signer.id}>
         <div className="contracts-original-avatar">{signer.status==='signed'?<CheckCircle2 size={14}/>:<User size={14}/>}</div>
         <div className="contracts-original-row-copy"><strong>{signer.name}</strong><span><MailCheck size={12}/>{signer.email}</span></div>
         <span className="contracts-original-outline-badge">{signerRoleLabel[signer.role]??signer.role}</span>
        </article>)}</div>
        {!alreadySent&&<div className="contracts-original-signing-cta"><div><strong>Pronto para assinar?</strong><p>Envie o contrato para os {contract.signers.length} signatário(s) via plataforma de assinatura digital.</p></div><button className="crm-btn primary small" onClick={()=>setSigning(true)}><Send size={14}/>Enviar para Assinatura</button></div>}
       </div>:<div className="contracts-original-empty"><div><PenLine size={32}/></div><strong>Nenhum signatário definido</strong><span>Adicione signatários no formulário do contrato.</span></div>}

       {alreadySent&&<div className="contracts-original-process">
        <div className="contracts-original-process-head"><p className="contracts-original-section-title">Processo de Assinatura Digital</p>{contract.signingProvider&&<span className="contracts-original-outline-badge">{contract.signingProvider}</span>}</div>
        <div className="contracts-original-process-card"><div className="contracts-original-process-icon"><PenLine size={16}/></div><div><strong>{contract.document.title||contract.title}</strong><div><span className={`contracts-status status-${contract.status}`}>{optionLabel(signatureStatusOptions,contract.signatureStatus)}</span></div></div>{contract.signers.length>0&&contract.signatureStatus!=='signed'&&<button className="crm-btn secondary small" onClick={()=>setSigning(true)}><Send size={12}/>Reenviar</button>}</div>
        {contract.signers.length>0&&<div className="contracts-original-list">{[...contract.signers].sort((a,b)=>a.order-b.order).map(signer=><article className="contracts-original-row-card" key={`process-${signer.id}`}><div className="contracts-original-avatar">{signer.status==='signed'?<CheckCircle2 size={14}/>:<User size={14}/>}</div><div className="contracts-original-row-copy"><strong>{signer.name}</strong><span><MailCheck size={12}/>{signer.email}</span></div><div className="contracts-original-signer-status"><span className="contracts-original-outline-badge">{signerRoleLabel[signer.role]??signer.role}</span><span className="contracts-original-outline-badge">{optionLabel(signatureStatusOptions,signer.status)}</span></div></article>)}</div>}
        {contract.timeline.length>0&&<div className="contracts-original-events"><p className="contracts-original-section-title">Histórico de eventos</p>{[...contract.timeline].slice(-5).reverse().map(item=><div key={item.id}><span/><p><strong>{item.event}</strong><small>{item.description} · {formatDateTime(item.createdAt)}</small></p></div>)}</div>}
       </div>}
      </section>}

      {tab==='document'&&<section className="contracts-original-tab-content">
       {contract.document.signedFileUrl?<article className="contracts-original-file-card"><div className="contracts-original-file-icon"><FileText size={32}/></div><div><strong>{contract.title}</strong><code>{contract.document.signedFileUrl}</code></div><a className="crm-btn primary" href={contract.document.signedFileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/>Abrir PDF</a></article>:<div className="contracts-original-empty plain"><FileText size={48}/><strong>Nenhum arquivo vinculado</strong><span>O documento principal permanece disponível no editor e preview A4.</span></div>}
      </section>}

      {tab==='versions'&&<section className="contracts-original-tab-content">{contract.document.versions.length>0?<div className="contracts-original-list versions">{contract.document.versions.map((version,index)=><article className="contracts-original-version-card" key={version.id}><div className="contracts-original-history-icon"><History size={16}/></div><div><div className="contracts-original-version-title"><strong>Versão {version.version}</strong>{index===contract.document.versions.length-1&&<span className="contracts-original-current-badge">Atual</span>}</div><span><Clock size={12}/>{formatDate(version.createdAt)}</span><span><User size={12}/>{version.createdBy}</span>{version.notes&&<p>{version.notes}</p>}</div>{version.fileUrl&&<a className="crm-btn secondary small" href={version.fileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={12}/>Abrir</a>}</article>)}</div>:<div className="contracts-original-empty plain"><History size={48}/><strong>Sem histórico de versões</strong><span>As versões do documento aparecerão aqui ao editar um contrato protegido.</span></div>}</section>}

      {tab==='attachments'&&<section className="contracts-original-tab-content">{contract.attachments.length>0?<div className="contracts-original-list versions">{contract.attachments.map(attachment=><article className="contracts-original-version-card" key={attachment.id}><div className="contracts-original-history-icon"><FileText size={16}/></div><div><strong>{attachment.name}</strong><span>{attachment.size>0?`${Math.round(attachment.size/1024)} KB`:'—'}</span></div><a className="crm-btn secondary small" href={attachment.dataUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={12}/>Abrir</a></article>)}</div>:<div className="contracts-original-empty plain"><FileText size={48}/><strong>Nenhum documento anexado</strong><span>Edite o contrato para anexar documentos.</span></div>}</section>}

      {tab==='timeline'&&<section className="contracts-original-tab-content">{contract.timeline.length>0?<div className="contracts-original-list versions">{[...contract.timeline].reverse().map(item=><article className="contracts-original-version-card" key={item.id}><div className="contracts-original-history-icon"><History size={16}/></div><div><strong>{item.event}</strong><span><Clock size={12}/>{formatDateTime(item.createdAt)}</span><span><User size={12}/>{item.actor}</span>{item.description&&<p>{item.description}</p>}</div></article>)}</div>:<div className="contracts-original-empty plain"><History size={48}/><strong>Sem histórico registrado</strong><span>Os eventos do contrato aparecerão aqui.</span></div>}</section>}
     </div>
    </div>

    <footer className="contracts-original-footer">{contract.signers.length>0&&!alreadySent?<button className="crm-btn secondary small" onClick={()=>setSigning(true)}><Send size={14}/>Enviar para Assinatura</button>:<span/>}<button className="crm-btn secondary small" onClick={onClose}>Fechar</button></footer>
   </section>
  </div>
  {signing&&<SendForSigningDialog contract={contract} onClose={()=>setSigning(false)}/>} 
 </>
}

function InfoItem({label,value}:{label:string;value:string}){return <div><p className="contracts-original-field-label">{label}</p><p className="contracts-original-field-value">{value}</p></div>}
