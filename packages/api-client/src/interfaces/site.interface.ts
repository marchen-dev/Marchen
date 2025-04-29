interface SiteResponseType {
  title: string
  description: string
  keywords: string[]
  favicon: string
}

interface SitePatchRequestType {
  title?: string
  description?: string
  keywords?: string[]
  favicon?: string
}

export type { SitePatchRequestType, SiteResponseType }
