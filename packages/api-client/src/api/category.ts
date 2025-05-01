import { Delete, Get, Patch, Post } from '../fetch'
import type { CategoryResponseType } from '../interfaces/category.interface'
import type { DataWrapper } from '../interfaces/pagination.interface'

export const category = {
  get() {
    return Get<DataWrapper<CategoryResponseType[]>>(`/category`)
  },
  delete(ids: string) {
    return Delete(`/category/${ids}`)
  },
  deleteBySlug(slug: string) {
    return Delete(`/category?slug=${slug}`)
  },
  update(id: string, data: CategoryResponseType) {
    return Patch(`/category/${id}`, data)
  },
  post(data: CategoryResponseType) {
    return Post(`/category`, data)
  },
}
