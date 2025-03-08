'use client'

import { Button } from '@base/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@base/components/ui/Card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@base/components/ui/Form'
import { Input } from '@base/components/ui/Input'
import { Turnstile } from '@base/components/ui/Turnstile'
import { setToken } from '@base/lib/cookie'
import { enableTurnstile } from '@base/lib/env'
import { routerBuilder, Routes } from '@base/lib/route-builder'
import { apiClient } from '@base/services'
import type { Error } from '@base/services/fetch'
import type { UserLoginRequestType } from '@base/services/interfaces/user.interface'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTurnstile } from 'react-turnstile'
import { toast } from 'sonner'
import { z } from 'zod'

export default function LoginPage() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-2xl">登录</CardTitle>
        <CardDescription>请使用您的用户名和密码登录</CardDescription>
      </CardHeader>
      <SetUpForm />
    </Card>
  )
}

const formSchema = z.object({
  name: z.string().nonempty('用户名不能为空'),
  password: z.string().nonempty('密码不能为空'),
})

const SetUpForm = () => {
  const router = useRouter()
  const captchaToken = useRef<string | null>(null)
  const turnstile = useTurnstile()
  const { isPending, mutate } = useMutation({
    mutationFn: (user: UserLoginRequestType) => apiClient.user.login(user),
    onSuccess: (data) => {
      setToken(data.token, data.expiresIn)
      toast.success('登录成功')
      router.replace(routerBuilder(Routes.DASHBOARD))
    },
    onError: (error: Error) => {
      turnstile.reset()
      form.reset()
      captchaToken.current = null
      toast.error(error?.data?.message)
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      password: '',
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, password } = values
    const token = captchaToken.current
    if (!token && enableTurnstile) {
      toast.error('请完成验证')
      return
    }

    mutate({
      name,
      password,
      captchaToken: token ?? '',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
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
          <Turnstile
            className="pt-2"
            onVerify={(token) => {
              captchaToken.current = token
            }}
          />
        </CardContent>
        <CardFooter className="mt-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? '登录中...' : '登录'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}
