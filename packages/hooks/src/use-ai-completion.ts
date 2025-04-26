import type {} from '@ai-sdk/react'
import { useCompletion } from '@ai-sdk/react'
import { AI_STREAM_URL } from '@marchen/lib'

export const useAICompletion = (
  params: Parameters<typeof useCompletion>[0],
) => {
  const completion = useCompletion({
    api: AI_STREAM_URL,
    ...params,
  })

  return completion
}
