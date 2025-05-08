export interface AiGenerateResponseType {
  prompt: string
  model: string
  content: string | string[]
}

export type AiProvider = 'OPENAI'

export interface AiResponseType {
  id: string
  apiUrl: string
  provider: AiProvider
  model: string
  active: boolean
  system: boolean
  created: string
}

export interface AiRequestType {
  id?: string
  apiUrl: string
  apiKey: string
  provider: AiProvider
  model: string
  active: boolean
}
