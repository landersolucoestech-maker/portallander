import {usePublicHomeSections} from '../../features/site-manager/usePublicHomeSections'
import {HomePageRenderer} from './HomePageRenderer'

export function PublicHome(){
  const {sections,hydrated}=usePublicHomeSections()
  return <HomePageRenderer sectionConfigurations={sections} hydrated={hydrated}/>
}
