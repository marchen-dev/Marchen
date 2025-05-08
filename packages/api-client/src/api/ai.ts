import type { PromptType } from '@marchen/lib'

import { Delete, Get, Post, Put } from '../fetch'
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
    return Get<DataWrapper<AiResponseType[]>>(`/ai/all`)
  },
  post(params: AiRequestType) {
    return Post<AiResponseType>(`/ai`, params)
  },
  put(id: string, params: AiRequestType) {
    return Put<AiResponseType>(`/ai/${id}`, params)
  },
  delete(id: string) {
    return Delete(`/ai/${id}`)
  },
}
