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
  created: string
}

export interface AiRequestType {
  apiUrl: string
  apiKey: string
  provider: AiProvider
  model: string
}
