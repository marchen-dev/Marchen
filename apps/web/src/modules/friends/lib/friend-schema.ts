import { z } from 'zod'

export const friendSchema = z.object({
  name: z.string().min(1, '站点名称不能为空'),
  url: z.string().url('站点地址格式不正确'),
  introduce: z.string().min(1, '站点描述不能为空'),
  email: z.string().email('邮箱格式不正确'),
  avatar: z.string().url('头像格式不正确'),
  captchaToken: z.string().min(1, '请完成验证').optional(),
})
