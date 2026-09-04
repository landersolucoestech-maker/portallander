import {getRuntimeDataProvider} from './runtimeDataProvider'

const isProductionMock=()=>import.meta.env.PROD&&getRuntimeDataProvider().kind==='mock'

export const publicSiteReadModel={
 collaborationTypes(){return getRuntimeDataProvider().collaboration.types().filter(item=>item.active)},
 collaborationGuidelines(){return [...getRuntimeDataProvider().collaboration.guidelines()].sort((a,b)=>a.order-b.order)},
 socialChannels(){return isProductionMock()?[]:getRuntimeDataProvider().branding.socialChannels().filter(item=>item.active).sort((a,b)=>a.order-b.order)},
 branding(){return getRuntimeDataProvider().branding.config()},
 advertisingCampaigns(){return isProductionMock()?[]:getRuntimeDataProvider().advertising.campaigns().filter(item=>item.active)},
 advertisingFormats(){return isProductionMock()?[]:getRuntimeDataProvider().advertising.formats().filter(item=>item.active).sort((a,b)=>a.order-b.order)},
}
