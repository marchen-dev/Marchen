import type { PromptType } from '@marchen/lib'

import { Get, Post } from '../fetch'
import type {
  AiGenerateResponseType,
  AiRequestType,
  AiResponseType,
} from '../interfaces/ai.interface'
import type { DataWrapper } from '../interfaces/pagination.interface'

export const ai = {
  postGenerate(params: { type?: PromptType; prompt: string }) {
    return Post<AiGenerateResponseType>(`/ai/generate`, params)
  },
  getAll() {
    return Get<DataWrapper<AiResponseType[]>>(`/ai`)
  },
  post(params: AiRequestType) {
    return Post<AiResponseType>(`/ai`, params)
  },
}
