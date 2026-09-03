import type {HomeAdConfig} from '../../pages/home/models/adModel'
import type {EditorialAdConfig} from '../../shared/data/contracts'

export const mockDefaultHomeAdConfig:HomeAdConfig={
 active:true,title:'PORTAL LANDER',subtitle:'ANUNCIE AQUI · SUA MARCA NO RITMO CERTO!',buttonLabel:'SAIBA MAIS →',buttonUrl:'/anuncie',image:'',imageAlt:'Anúncio em destaque no Portal Lander',logo:'',logoAlt:'Logo do anunciante',logoWidth:140,height:440,contentWidth:1180,align:'center',
}

export const mockDefaultNewsAdConfig:EditorialAdConfig={
 active:true,label:'PUBLICIDADE',title:'ANUNCIE AQUI',subtitle:'SUA MARCA NO\nRITMO CERTO!',buttonLabel:'SAIBA MAIS →',buttonUrl:'/anuncie',openInNewTab:false,image:'',imageAlt:'Anúncio editorial do Portal Lander',background:'',advertiser:'',campaign:'',startDate:'',endDate:'',height:100,contentWidth:1170,align:'left',
}
