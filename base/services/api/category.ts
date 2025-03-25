import { Get } from '../fetch'
import type { CategoryResponseType } from '../interfaces/category.interface'

export const category = {
  get() {
    return Get<CategoryResponseType>(`/category`)
  },
}
