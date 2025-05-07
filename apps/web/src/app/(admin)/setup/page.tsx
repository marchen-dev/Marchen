'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Error } from '@marchen/api-client'
import { apiClient } from '@marchen/api-client'
import type { UserRegisterRequestType } from '@marchen/api-client/interfaces/user.interface'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@marchen/components/ui'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

export default function SetupPage() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-xl">初始化博客</CardTitle>
        <CardDescription>欢迎使用 Marchen 博客，请先完成初始化</CardDescription>
      </CardHeader>
      <SetUpForm />
    </Card>
  )
}

const formSchema = z.object({
  name: z.string().nonempty('用户名不能为空'),
  password: z.string().nonempty('密码不能为空'),
  repeatPassword: z.string().nonempty('请再次输入密码'),
  email: z.string().email('请输入正确的邮箱地址'),
})

const SetUpForm = () => {
  const router = useRouter()
  const { isPending, mutate } = useMutation({
    mutationFn: (user: UserRegisterRequestType) =>
      apiClient.user.postRegister(user),
    onSuccess: () => {
      toast.success('初始化成功')
      router.replace('/login')
    },
    onError: (error: Error) => {
      toast.error(error?.data?.message)
    },
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      password: '',
      repeatPassword: '',
      email: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, name, password, repeatPassword } = values
    if (password !== repeatPassword) {
      toast.info('两次输入的密码不一致！')
      return
    }

    mutate({
      email,
      name,
      password,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* 用户名 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input placeholder="请输入用户名" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 密码 */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="请输入密码" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 确认密码 */}
          <FormField
            control={form.control}
            name="repeatPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="请再次输入密码"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 邮箱 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="请输入邮箱地址" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? '正在初始化...' : '确认'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}
