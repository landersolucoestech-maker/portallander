import {Link} from 'react-router-dom'
import {portalLogo} from '../../shared/branding/assets/brandAsset'
import type {FooterBrandConfig} from '../../shared/branding/models/footerBrandModel'
import {editorialReadModel} from '../editorial/repository'
import {publicSiteReadModel} from '../../shared/data/publicSiteReadModel'

const socialAbbreviation:Record<string,string>={instagram:'IG',tiktok:'TK',youtube:'YT',x:'X',spotify:'SP',facebook:'FB',linkedin:'IN'}

export function FooterIdentityPreview({config}:{config:FooterBrandConfig}){
  const menuPages=editorialReadModel.listMenuPages().filter(page=>!page.parentId)
  const institutional=[['sobre','Sobre o Portal'],['contato','Fale Conosco'],['politica','Política de Privacidade']].filter(([slug])=>Boolean(editorialReadModel.getPageBySlug(slug)))
  const help=[['faq','Perguntas Frequentes'],['regras','Regras de Publicação']].filter(([slug])=>Boolean(editorialReadModel.getPageBySlug(slug)))
  const partnerships=editorialReadModel.getPageBySlug('parcerias')
  const socialChannels=publicSiteReadModel.socialChannels()
  return <div className="settings-footer-preview" aria-label="Preview do rodapé público">
    <div className="settings-footer-preview-label">PREVIEW DO RODAPÉ</div>
    <section className="pl-newsletter"><div className="public-shell"><div className="pl-newsletter-brand"><img src={portalLogo} alt=""/><strong>RECEBA AS PRINCIPAIS NOTÍCIAS<br/>DIRETO NO SEU E-MAIL!</strong></div><form onSubmit={event=>event.preventDefault()}><input type="email" placeholder="Seu melhor e-mail" aria-label="Seu melhor e-mail"/><button type="submit">INSCREVER-SE</button></form><div className="pl-social"><b>SIGA O PORTAL LANDER</b>{socialChannels.map(channel=><span key={channel.id} title={channel.label}>{socialAbbreviation[channel.network]??channel.label.slice(0,2).toUpperCase()}</span>)}</div></div></section>
    <footer className="public-footer"><div className="public-shell"><div className="pl-footer-grid"><div className="pl-footer-about">{config.active&&config.image&&<img src={config.image} alt={config.imageAlt||'Portal Lander'} style={{width:`${config.width}px`,maxWidth:'100%',height:'auto'}}/>}<p>O maior portal de notícias sobre funk, cultura urbana e entretenimento. Conteúdo real, direto e sem filtro.</p></div><div className="pl-footer-col"><h4>NAVEGAÇÃO</h4>{menuPages.map(page=><Link key={page.id} to={`/${page.slug}`}>{page.navigationLabel}</Link>)}</div><div className="pl-footer-col"><h4>INSTITUCIONAL</h4>{institutional.map(([slug,label])=><Link key={slug} to={`/${slug}`}>{label}</Link>)}<Link to="/colabore">Colabore</Link></div><div className="pl-footer-col"><h4>AJUDA</h4>{help.map(([slug,label])=><Link key={slug} to={`/${slug}`}>{label}</Link>)}<Link to="/anuncie">Como Anunciar</Link></div><div className="pl-footer-col"><h4>COLABORE</h4><Link to="/colabore">Envie sua notícia</Link><Link to="/colabore">Envie seu vídeo</Link>{partnerships&&<Link to="/parcerias">Parcerias</Link>}</div></div><div className="pl-copyright">© 2026 Portal Lander. Todos os direitos reservados.</div></div></footer>
  </div>
}
