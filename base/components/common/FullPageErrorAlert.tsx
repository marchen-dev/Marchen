'use client'

import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import type { FC } from 'react'

import { Button } from '../ui/Button'

export const FullPageErrorAlert: FC<{ message?: string }> = (props) => {
  const { message = '发生了一些错误，请稍后再试' } = props

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-background to-background/95 p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-12 text-destructive" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-md text-center"
      >
        <h2 className="mb-3 text-3xl font-bold text-foreground">
          糟糕！出错了
        </h2>
        <p className="mb-6 text-lg text-muted-foreground">{message}</p>
        <p className="mb-8 text-sm text-muted-foreground/80">
          如果问题依然存在，请联系管理员
        </p>

        <Button
          size="lg"
          variant="outline"
          className="group rounded-full border-muted-foreground/20 transition-all hover:border-cn-primary hover:bg-cn-primary/5"
          onClick={() => {
            window.location.href = '/'
          }}
        >
          <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
          返回首页
        </Button>
      </motion.div>
    </div>
  )
}
