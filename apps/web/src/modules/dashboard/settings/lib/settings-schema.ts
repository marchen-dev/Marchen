import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  nickname: z.string().min(1, '昵称不能为空'),
  introduce: z.string().nullish(),
  email: z.string().email('邮箱格式不正确'),
  avatar: z.string().url('头像格式不正确'),
  social: z.record(z.string(), z.string()),
})

export const websiteSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().min(1, '描述不能为空'),
  keywords: z.array(z.string()).min(1, '关键词不能为空'),
  favicon: z.string().url('favicon格式不正确'),
})
