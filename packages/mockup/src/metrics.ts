export type MockupMetricsRange='today'|'7d'|'30d'|'90d'|'custom'

type Input={range?:MockupMetricsRange;startDate?:string;endDate?:string}
const FIXED_TODAY='2026-09-06'
const shift=(value:string,days:number)=>{const date=new Date(`${value}T12:00:00.000Z`);date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10)}
const days=(start:string,end:string)=>Math.floor((new Date(`${end}T12:00:00.000Z`).getTime()-new Date(`${start}T12:00:00.000Z`).getTime())/86_400_000)+1
const metric=(value:number)=>({value,status:'available' as const})

function range(input:Input){
  const preset=input.range||'30d'
  const endDate=preset==='custom'&&input.endDate?input.endDate:FIXED_TODAY
  const startDate=preset==='custom'&&input.startDate?input.startDate:preset==='today'?endDate:preset==='7d'?shift(endDate,-6):preset==='90d'?shift(endDate,-89):shift(endDate,-29)
  return {preset,startDate,endDate,days:days(startDate,endDate),timezone:'America/Sao_Paulo'}
}

export function getMockupMetricsOverview(input:Input={}){
  const resolved=range(input)
  return {
    range:resolved,
    ga4:{
      status:'available' as const,provider:'google-analytics',propertyId:'mockup:property:portal-lander',
      overview:{users:metric(128400),newUsers:metric(35400),sessions:metric(176900),pageviews:metric(548200),pageviewsPerUser:metric(4.27),engagementRate:metric(.64),averageSessionDuration:metric(132)},
      returningUsers:metric(93000),
      acquisition:[
        {channel:'Organic Search',sessions:82400,users:61300},
        {channel:'Direct',sessions:48700,users:39100},
        {channel:'Organic Social',sessions:29800,users:21400},
        {channel:'Referral',sessions:16000,users:11300},
      ],
      pages:[
        {path:'/noticias/mercado-musical-2026',title:'Mercado musical acelera em 2026',pageviews:48600,users:32100},
        {path:'/lancamentos/novidades-da-semana',title:'Novidades da semana',pageviews:39700,users:27400},
        {path:'/entrevistas/cena-independente',title:'A nova cena independente',pageviews:33100,users:22900},
        {path:'/agenda/festivais-brasil',title:'Festivais no Brasil',pageviews:28400,users:20100},
      ],
      partial:{acquisition:false,content:false,returning:false},
    },
    editorial:{
      status:'available' as const,
      counts:{published:42,drafts:7,archived:5,publishedInPeriod:16},
      latest:[
        {id:'content_mock_009',title:'Mercado musical acelera em 2026',slug:'mercado-musical-2026',pageSlug:'noticias',pageTitle:'Notícias',publishedAt:'2026-09-05T15:00:00.000Z'},
        {id:'content_mock_008',title:'Novidades da semana',slug:'novidades-da-semana',pageSlug:'lancamentos',pageTitle:'Lançamentos',publishedAt:'2026-09-04T14:00:00.000Z'},
        {id:'content_mock_007',title:'A nova cena independente',slug:'cena-independente',pageSlug:'entrevistas',pageTitle:'Entrevistas',publishedAt:'2026-09-03T12:00:00.000Z'},
      ],
    },
    conversions:{
      status:'available' as const,total:24,leadsCreated:11,collaborationsCreated:13,
      contexts:{contato:11,colabore:7,anuncie:6},
      forms:[
        {slug:'contato-comercial',name:'Contato Comercial',purpose:'lead_capture',entryContext:'contato',count:11,leadsCreated:11,collaborationsCreated:0},
        {slug:'colabore-anuncie',name:'Colabore / Anuncie',purpose:'editorial_submission',entryContext:'colabore',count:7,leadsCreated:0,collaborationsCreated:7},
        {slug:'colabore-anuncie',name:'Colabore / Anuncie',purpose:'editorial_submission',entryContext:'anuncie',count:6,leadsCreated:0,collaborationsCreated:6},
      ],
    },
    generatedAt:'2026-09-06T09:30:00.000Z',
  }
}
