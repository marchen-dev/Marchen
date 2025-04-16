'use client'

import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import type { FC } from 'react'

import { Button } from '../ui/Button'

export const FullPageErrorAlert: FC<{ message?: string }> = (props) => {
  const { message = '发生了一些错误，请稍后再试' } = props

  return (
    <div className="from-background to-background/95 flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="bg-destructive/10 mx-auto mb-6 flex size-24 items-center justify-center rounded-full">
          <AlertCircle className="text-destructive size-12" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-md text-center"
      >
        <h2 className="text-foreground mb-3 text-3xl font-bold">
          糟糕！出错了
        </h2>
        <p className="text-muted-foreground mb-6 text-lg">{message}</p>
        <p className="text-muted-foreground/80 mb-8 text-sm">
          如果问题依然存在，请联系管理员
        </p>

        <Button
          size="lg"
          variant="outline"
          className="border-muted-foreground/20 hover:border-cn-primary hover:bg-cn-primary/5 group rounded-full transition-all"
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
