import {getRuntimeDataProvider} from '../../../shared/data/runtimeDataProvider'

export type HomeStory = { category:string; title:string; meta:string; views:string; image:string }
export type HomeAgendaItem = { day:string; month:string; title:string; place:string }

export const homeReadModel={
  get stories(){return getRuntimeDataProvider().home.stories()},
  get featuredStories(){return getRuntimeDataProvider().home.stories().slice(0,6)},
  get latestStories(){return getRuntimeDataProvider().home.stories().slice(4,12)},
  get mostRead(){return getRuntimeDataProvider().home.mostRead()},
  get agenda(){return getRuntimeDataProvider().home.agenda()},
  source:'data-provider' as const,
}
