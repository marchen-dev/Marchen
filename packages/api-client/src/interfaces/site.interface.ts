interface SiteResponseType {
  title: string
  description: string
  keywords: string[]
  favicon: string
  url: string
}

interface SitePatchRequestType {
  title?: string
  description?: string
  keywords?: string[]
  favicon?: string
  url?: string
}

export type { SitePatchRequestType, SiteResponseType }
