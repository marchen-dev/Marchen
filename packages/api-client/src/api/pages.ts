import { Delete, Get, Patch, Post } from '../fetch'
import type {
  PageCreateRequestType,
  PageResponseType,
  PageUpdateRequestType,
} from '../interfaces/page.interface'
import type { DataWrapper } from '../interfaces/pagination.interface'

export const pages = {
  get() {
    return Get<DataWrapper<PageResponseType[]>>(`/pages`)
  },
  getById(id: string) {
    return Get<PageResponseType>(`/pages/${id}`)
  },
  post(params: PageCreateRequestType) {
    return Post<PageResponseType>(`/pages`, params)
  },
  patch(id: string, params: PageUpdateRequestType) {
    return Patch<PageResponseType>(`/pages/${id}`, params)
  },
  delete(id: string) {
    return Delete(`/pages/${id}`)
  },
}
