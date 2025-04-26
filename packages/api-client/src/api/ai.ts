import type { PromptType } from '@marchen/lib'

import { Post } from '../fetch'
import type { AiResponseType } from '../interfaces/ai.interface'

export const ai = {
  post(params: { type?: PromptType; prompt: string }) {
    return Post<AiResponseType>(`/ai`, params)
  },
}
