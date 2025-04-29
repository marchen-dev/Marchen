import { Get, Patch } from '../fetch'
import type {
  SitePatchRequestType,
  SiteResponseType,
} from '../interfaces/site.interface'

export const site = {
  get() {
    return Get<SiteResponseType>(`/site`)
  },
  patch(data: SitePatchRequestType) {
    return Patch<SiteResponseType>(`/site`, data)
  },
}
