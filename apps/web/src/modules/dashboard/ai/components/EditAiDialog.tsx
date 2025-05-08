'use client'

import type { AiRequestType } from '@marchen/api-client/interfaces/ai.interface'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputWithLabel,
  SelectWithLabel,
  SwitchWithLabel,
} from '@marchen/components/ui'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { useAiMutation, useEditAiDialog } from '../hooks/use-ai-table'

const openAiBaseUrl = 'https://api.openai.com/v1'

export const EditAiDialog = () => {
  const { value, onChange } = useEditAiDialog()
  const { isOpen, ai } = value
  const form = useForm<AiRequestType>()
  const {
    updateAi: { mutate, isSuccess },
  } = useAiMutation()
  const isEdit = !!ai?.id
  const isSystem = ai?.system
  useEffect(() => {
    form.setValue(
      'apiUrl',
      isSystem ? '系统默认' : (ai?.apiUrl ?? openAiBaseUrl),
    )
    form.setValue('apiKey', '')
    form.setValue('provider', ai?.provider ?? 'OPENAI')
    form.setValue('model', ai?.model ?? '')
    form.setValue('active', ai?.active ?? false)
  }, [ai, form, isSystem])

  useEffect(() => {
    if (isSuccess) {
      onChange(false)
      form.reset()
    }
  }, [isSuccess, onChange, form])

  const descriptionPrompt = useMemo(() => {
    if (isSystem) {
      return (
        <span className="text-destructive">
          此为系统默认模型，仅支持修改「是否启用」
        </span>
      )
    }
    if (isEdit) {
      return '修改 AI 模型'
    }
    return '添加 AI 模型'
  }, [isEdit, isSystem])

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="sm:max-w-[370px]" outSideClose={false}>
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑模型' : '添加模型'}</DialogTitle>
          <DialogDescription>{descriptionPrompt}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => {
            mutate({ id: ai?.id, ...data })
          })}
        >
          <div className="flex flex-col gap-4 py-4">
            <SelectWithLabel
              label="提供商"
              groups={[{ label: 'OpenAI', value: 'OPENAI' }]}
              defaultValue={form.getValues('provider')}
              onValueChange={(value) => {
                form.setValue('provider', value as 'OPENAI')
              }}
              disabled={isSystem}
            />
            <InputWithLabel
              label="API 地址"
              placeholder={openAiBaseUrl}
              {...form.register('apiUrl')}
              disabled={isSystem}
            />
            <InputWithLabel
              label="API Key"
              type="password"
              {...form.register('apiKey')}
              disabled={isSystem}
            />
            <InputWithLabel
              label="模型"
              {...form.register('model')}
              disabled={isSystem}
            />
            <SwitchWithLabel
              label="启用"
              {...form.register('active')}
              defaultChecked={ai?.active}
              onCheckedChange={(checked) => {
                form.setValue('active', checked)
              }}
            />
          </div>

          <DialogFooter>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
