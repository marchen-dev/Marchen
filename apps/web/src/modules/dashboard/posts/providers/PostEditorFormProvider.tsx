'use client'

import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import type { FC } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

interface PostEditorFormProps {
  children: React.ReactNode
  postData?: PostResponseType
}

export interface EditorFormData {
  title: string
  content: string
}

export const PostEditorFormProvider: FC<PostEditorFormProps> = ({
  children,
  postData,
}) => {
  const methods = useForm<EditorFormData>({
    defaultValues: {
      title: postData?.title ?? '',
      content: postData?.content ?? '',
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    console.info(data)
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>{children}</form>
    </FormProvider>
  )
}
