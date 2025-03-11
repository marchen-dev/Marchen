interface CategoryResponseType {
  id: string
  name: string
  slug: string
  created: Date
}

interface CategoryCreateRequestType {
  name: string
  slug: string
}

interface CategoryUpdateRequestType {
  name?: string
  slug?: string
}

export type {
  CategoryCreateRequestType,
  CategoryResponseType,
  CategoryUpdateRequestType,
}
