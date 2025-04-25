'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Error } from '@marchen/api-client'
import { apiClient } from '@marchen/api-client'
import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
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
    categoryId: '分类',
    cover: '封面',
  }
  return displayNames[field] || field
}

const formSchema = z.object({
  title: z.string().nonempty('标题不能为空'),
  content: z.string().nonempty('内容不能为空'),
  slug: z
    .string()
    .nonempty('文章路径不能为空')
    .refine((value) => !value.includes('/'), {
      message: '文章路径不能包含斜杠(/)',
    }),
  categoryId: z.string().nonempty('分类不能为空'),
  tags: z.array(z.string()),
  cover: z.string().optional(),
  summary: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PostEditorFormProps {
  children: React.ReactNode
  postData?: PostResponseType
}

export const PostEditorFormProvider: FC<PostEditorFormProps> = ({
  children,
  postData,
}) => {
  const id = useSearchParams().get('id') as string
  const router = useRouter()
  const isUpdate = !!id

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: postData?.title ?? '',
      content: postData?.content ?? '',
      slug: postData?.slug ?? '',
      categoryId: postData?.categoryId ?? '',
      tags: postData?.tags ?? [],
      cover: postData?.cover,
      summary: postData?.summary?.text ?? '',
    },
  })

  const onSubmit = methods.handleSubmit(
    async (data) => {
      try {
        const postData = { ...data }
        if (postData.cover === '' || postData.cover === undefined) {
          delete postData.cover
        }

        if (isUpdate) {
          await apiClient.posts.patch(id, postData)
        } else {
          await apiClient.posts.post(postData)
        }
        toast.success(isUpdate ? '更新成功' : '发布成功')
        router.push(Routes.DASHBOARD_POSTS_VIEW)
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
