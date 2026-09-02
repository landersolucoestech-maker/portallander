import type {PublicEditorialSnapshot} from '../../features/editorial/apiClient'
import type {ApplicationDataProvider} from './dataProvider'

const clone=<T>(value:T):T=>structuredClone(value)

export function withEditorialSnapshot(base:ApplicationDataProvider,snapshot:PublicEditorialSnapshot):ApplicationDataProvider{
  return {
    ...base,
    kind:'api',
    editorial:{
      ...base.editorial,
      pages:()=>clone(snapshot.pages),
      contents:()=>clone(snapshot.contents),
    },
  }
}
