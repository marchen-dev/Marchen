import { createOpenAI } from '@ai-sdk/openai'

import { API_URL } from './env'

export const ai = createOpenAI({
  baseURL: `${API_URL}/ai/stream`,
})

type PromptType = 'summary' | 'category'

export const promptTools = (params: { type: PromptType; content: string }) => {
  const { type, content } = params
  switch (type) {
    case 'summary': {
      return `请将以下内容生成不超过150字的纯文本摘要：${content}`
    }
    default: {
      throw new Error(`Invalid prompt type: ${type}`)
    }
  }
}
