import { Button, Label, Textarea } from '@marchen/components/ui'
import { useAICompletion } from '@marchen/hooks'
import { promptTools } from '@marchen/lib'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

export const AdvancedSetting = () => {
  return (
    <div>
      <AISummary />
    </div>
  )
}

const AISummary = () => {
  const { getValues, register, setValue } = useFormContext()
  const { handleSubmit, completion, isLoading } = useAICompletion({
    initialInput: promptTools({
      type: 'summary',
      content: getValues('content'),
    }),
    initialCompletion: getValues('summary'),
  })

  useEffect(() => {
    setValue('summary', completion)
  }, [completion, setValue])

  return (
    <div className="grid w-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="message">AI 摘要</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          <i className="icon-[mingcute--refresh-3-line] size-4" />
          点击生成
        </Button>
      </div>
      <Textarea
        placeholder="点击按钮生成摘要"
        {...register('summary')}
        disabled={isLoading}
      />
    </div>
  )
}
