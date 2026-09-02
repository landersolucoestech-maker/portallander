import type {EditorialPage} from '../../features/editorial/model'
import {useEditorialSeo} from '../../features/editorial/hooks/useEditorialSeo'
import {useSectionConfiguration} from '../../features/site-manager/useSectionConfiguration'
import {PublicFooter,PublicHeader} from '../../shared/public/PublicChrome'

export function SobrePage({page}:{page:EditorialPage}){
  useEditorialSeo(page)
  const hero=useSectionConfiguration(page.id,'sobre-hero','Hero Institucional')
  const body=useSectionConfiguration(page.id,'sobre-conteudo','Conteúdo Institucional')
  return <div className="public-page sobre-page">
    <PublicHeader/>
    <main>
      {hero.active&&<section className="public-standard-page-hero" style={{background:hero.background,color:hero.textColor,textAlign:hero.textAlign,position:'relative',overflow:'hidden'}}>{hero.imageUrl&&<img src={hero.imageUrl} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.25}}/>}<div className="public-shell" style={{position:'relative',zIndex:1}}><div className="news-page-intro-copy"><span style={{color:hero.accentColor}}>{hero.eyebrow||'INSTITUCIONAL'}</span><h1>{hero.title||page.title.toUpperCase()}</h1><p>{hero.description||page.description}</p></div></div></section>}
      {body.active&&<section className="public-shell article-shell" style={{background:body.background,color:body.textColor,textAlign:body.textAlign}}><article className="article-content">{body.eyebrow&&<span style={{color:body.accentColor}}>{body.eyebrow}</span>}<h2>{body.title||'PORTAL LANDER'}</h2><p>{body.description||page.description}</p></article></section>}
    </main>
    <PublicFooter/>
  </div>
}
