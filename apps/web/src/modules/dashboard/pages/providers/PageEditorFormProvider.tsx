'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Error } from '@marchen/api-client'
import { apiClient } from '@marchen/api-client'
import type { PageResponseType } from '@marchen/api-client/interfaces/page.interface'
import { Routes } from '@marchen/lib'
import { useRouter, useSearchParams } from 'next/navigation'
import type { FC } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// 获取字段的显示名称
const getFieldDisplayName = (field: string) => {
  const displayNames: Record<string, string> = {
    title: '标题',
    content: '文章内容',
    slug: '文章路径',
    summary: 'AI 摘要',
    icon: '页面图标',
  }
  return displayNames[field] || field
}

const pageFormSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  slug: z
    .string()
    .nonempty('文章路径不能为空')
    .refine((value) => !value.includes('/'), {
      message: '文章路径不能包含斜杠(/)',
    }),
  summary: z.string().optional(),
  icon: z.string().optional(),
})

type FormValues = z.infer<typeof pageFormSchema>

interface PageEditorFormProviderProps {
  pageData?: PageResponseType
  children: React.ReactNode
}

export const PageEditorFormProvider: FC<PageEditorFormProviderProps> = ({
  pageData,
  children,
}) => {
  const id = useSearchParams().get('id') as string
  const router = useRouter()
  const isUpdate = !!id
  const methods = useForm<FormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: pageData?.title || '',
      content: pageData?.content || '',
      slug: pageData?.slug || '',
      summary: pageData?.summary || '',
      icon: pageData?.icon || '',
    },
  })
  const onSubmit = methods.handleSubmit(
    async (data) => {
      try {
        if (isUpdate) {
          await apiClient.pages.patch(id, data)
        } else {
          await apiClient.pages.post(data)
        }
        toast.success(isUpdate ? '更新成功' : '发布成功')
        router.push(Routes.DASHBOARD_PAGES_VIEW)
      } catch (error: unknown) {
        toast.error('发布失败', {
          description: (error as Error).data.message,
        })
      }
    },
    (errors) => {
      // 处理验证错误
      const errorFields = Object.entries(errors)
      if (errorFields.length > 0) {
        const [field, error] = errorFields[0]
        toast.error(error?.message?.toString() || `${field}不能为空`, {
          description: `请填写${getFieldDisplayName(field)}`,
        })
      }
    },
  )
  return (
    <FormProvider {...methods}>
      <form className="h-full" onSubmit={onSubmit}>
        {children}
      </form>
    </FormProvider>
  )
}
