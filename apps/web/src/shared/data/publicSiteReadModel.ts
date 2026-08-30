import {getRuntimeDataProvider} from './runtimeDataProvider'

export const publicSiteReadModel={
 collaborationTypes(){return getRuntimeDataProvider().collaboration.types().filter(item=>item.active)},
 collaborationGuidelines(){return [...getRuntimeDataProvider().collaboration.guidelines()].sort((a,b)=>a.order-b.order)},
 socialChannels(){return getRuntimeDataProvider().branding.socialChannels().filter(item=>item.active).sort((a,b)=>a.order-b.order)},
 branding(){return getRuntimeDataProvider().branding.config()},
 advertisingCampaigns(){return getRuntimeDataProvider().advertising.campaigns().filter(item=>item.active)},
 advertisingFormats(){return getRuntimeDataProvider().advertising.formats().filter(item=>item.active).sort((a,b)=>a.order-b.order)},
}
