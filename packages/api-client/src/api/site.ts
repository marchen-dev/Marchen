import { Get } from '../fetch'
import type { SiteResponseType } from '../interfaces/site.interface'

export const site = {
  get() {
    return Get<SiteResponseType>(`/site`)
  },
}
