import { Get } from '../fetch'
import type { CategoryResponseType } from '../interfaces/category.interface'
import type { DataWrapper } from '../interfaces/pagination.interface'

export const category = {
  get() {
    return Get<DataWrapper<CategoryResponseType[]>>(`/category`)
  },
}
