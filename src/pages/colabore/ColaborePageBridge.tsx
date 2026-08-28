import { CheckCircle2, Send, ShieldCheck, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PublicFooter, PublicHeader } from '../../PortalApp'

type SubmissionType='noticia'|'video'|'foto'|'pauta'|''

const submissionLabels:Record<Exclude<SubmissionType,''>,string>={
  noticia:'Notícia / Pauta',
  video:'Vídeo',
  foto:'Foto / Galeria',
  pauta:'Sugestão de Pauta',
}

export function ColaborePageBridge(){
  const location=useLocation()
  const [type,setType]=useState<SubmissionType>('')
  const [typeOpen,setTypeOpen]=useState(false)
  const [fileName,setFileName]=useState('')
  const [sent,setSent]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  if(location.pathname!=='/colabore')return null

  const submit=(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    if(!type){
      setTypeOpen(true)
      return
    }
    setSent(true)
    window.setTimeout(()=>setSent(false),5000)
    e.currentTarget.reset()
    setType('')
    setTypeOpen(false)
    setFileName('')
  }

  return <div className="public-page colabore-page">
    <PublicHeader/>
    <main>
      <section className="colabore-hero public-standard-page-hero">
        <div className="public-shell colabore-hero-grid">
          <div className="colabore-hero-copy">
            <span className="colabore-eyebrow">PARTICIPE DO PORTAL</span>
            <h1>SUA HISTÓRIA<br/><em>PODE VIRAR NOTÍCIA.</em></h1>
            <p>Tem uma pauta, vídeo, foto, denúncia, lançamento ou história relevante? Envie seu material para o Portal Lander. Nossa equipe editorial analisa cada envio antes da publicação.</p>
            <div className="colabore-hero-points">
              <span><ShieldCheck size={17}/> Material analisado pela equipe editorial</span>
              <span><CheckCircle2 size={17}/> Envio gratuito e sem compromisso de publicação</span>
            </div>
          </div>
        </div>
      </section>

      <section className="public-shell colabore-content">
        <div className="colabore-guidelines">
          <div className="colabore-guidelines-copy">
            <span>ANTES DE ENVIAR</span>
            <h2>O QUE PROCURAMOS</h2>
            <p>Conteúdo relevante para funk, rap, trap, cultura urbana, entretenimento, bastidores, lançamentos e acontecimentos da cena.</p>
          </div>
          <div className="colabore-guideline"><b>01</b><span>Informação clara e verificável</span></div>
          <div className="colabore-guideline"><b>02</b><span>Material original ou com fonte identificada</span></div>
          <div className="colabore-guideline"><b>03</b><span>Contexto suficiente para análise editorial</span></div>
        </div>

        <div className="colabore-layout">
          <form className="colabore-form" onSubmit={submit}>
            {sent&&<div className="colabore-success"><CheckCircle2 size={18}/><div><b>Material recebido.</b><span>Obrigado por colaborar. A equipe editorial fará a análise.</span></div></div>}

            <div className="colabore-field-grid">
              <label>Seu nome<input required name="nome" placeholder="Nome completo"/></label>
              <label>E-mail<input required type="email" name="email" placeholder="voce@email.com"/></label>
              <label>WhatsApp <small>(opcional)</small><input name="whatsapp" placeholder="(00) 00000-0000"/></label>
              <label>Cidade / Estado<input name="local" placeholder="Ex.: Rio de Janeiro, RJ"/></label>
            </div>

            <div className="colabore-field-grid colabore-title-type-grid">
              <label>Título<input required name="titulo" placeholder="Resuma o assunto em uma frase"/></label>
              <label>Assunto / Tipo de conteúdo
                <div className={`colabore-type-select${typeOpen?' open':''}`}>
                  <button
                    type="button"
                    className={`colabore-type-trigger${type?' has-value':''}`}
                    aria-haspopup="listbox"
                    aria-expanded={typeOpen}
                    onClick={()=>setTypeOpen(open=>!open)}
                  >
                    <span>{type?submissionLabels[type]:'Selecione o tipo de conteúdo'}</span>
                    <i aria-hidden="true"/>
                  </button>
                  {typeOpen&&<div className="colabore-type-menu" role="listbox" aria-label="Assunto / Tipo de conteúdo">
                    {(Object.entries(submissionLabels) as [Exclude<SubmissionType,''>,string][]).map(([value,label])=><button
                      key={value}
                      type="button"
                      role="option"
                      aria-selected={type===value}
                      className={type===value?'selected':''}
                      onClick={()=>{setType(value);setTypeOpen(false)}}
                    >{label}</button>)}
                  </div>}
                  <input type="hidden" name="tipo" value={type}/>
                </div>
              </label>
            </div>

            <label>Conte a história<textarea required name="mensagem" rows={7} placeholder="Explique o que aconteceu, quem está envolvido, quando, onde e por que isso é relevante."/></label>
            <label>Fonte ou link de referência <small>(opcional)</small><input type="url" name="fonte" placeholder="https://"/></label>

            <div className="colabore-upload" onClick={()=>fileRef.current?.click()} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')fileRef.current?.click()}}>
              <Upload size={22}/>
              <div><b>{fileName||'Anexar arquivo'}</b><span>Imagem, vídeo ou documento de apoio.</span></div>
              <button type="button">SELECIONAR</button>
              <input ref={fileRef} hidden type="file" accept="image/*,video/*,.pdf,.doc,.docx" onChange={e=>setFileName(e.target.files?.[0]?.name||'')}/>
            </div>

            <label className="colabore-consent"><input required type="checkbox"/><span>Confirmo que as informações enviadas são verdadeiras e que possuo autorização para compartilhar os materiais anexados quando necessário.</span></label>
            <button className="colabore-submit" type="submit"><Send size={17}/> ENVIAR PARA ANÁLISE</button>
            <p className="colabore-note">O envio não garante publicação. O Portal Lander poderá entrar em contato para confirmar informações ou solicitar material complementar.</p>
          </form>
        </div>
      </section>
    </main>
    <PublicFooter/>
  </div>
}
