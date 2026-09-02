import type {SectionConfiguration} from '../sectionConfiguration'
import type {HomeRenderedSectionId} from '../../../pages/home/HomePageRenderer'

export const HOME_PREVIEW_MESSAGE='portal-lander:home-page-preview'

export type HomePreviewMessage={
  type:typeof HOME_PREVIEW_MESSAGE
  sectionId:HomeRenderedSectionId
  configuration:SectionConfiguration
}
