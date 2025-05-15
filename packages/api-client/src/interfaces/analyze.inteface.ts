interface AnalyzeResponseType {
  id: number
  ip: string
  path: string
  userAgent: string
  referer: string | null
  method: string
  statusCode: number
  duration: number
  created: string
}

interface AnalyzeRequestType {
  day?: string
}

export type { AnalyzeRequestType, AnalyzeResponseType }
