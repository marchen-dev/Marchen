interface PageResponseType {
  id: string
  title: string
  content: string
  slug: string
  summary?: string
  icon?: string
  read: number
  updated: Date
  created: Date
}

interface PageCreateRequestType {
  title: string
  content: string
  slug: string
  summary?: string
  icon?: string
}

interface PageUpdateRequestType {
  title?: string
  content?: string
  slug?: string
  summary?: string
  icon?: string
}

export type { PageCreateRequestType, PageResponseType, PageUpdateRequestType }
