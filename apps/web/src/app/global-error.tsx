'use client'

import '../styles/index.css'

import { FullPageErrorAlert } from '@marchen/components/common'
import { sansFont, serifFont } from '@marchen/lib'

export default function GlobalError() {
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        <title>访问网页出现问题</title>
      </head>
      <body
        className={`${sansFont.variable} ${serifFont.variable} m-0 h-full p-0 font-sans`}
      >
        <FullPageErrorAlert />
      </body>
    </html>
  )
}
