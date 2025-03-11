import { FullPageErrorAlert } from '@base/components/common/FullPageErrorAlert'
import { sansFont } from '@base/lib/fonts'

export default function NotFoundPage() {
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        <title>访问网页出现问题</title>
      </head>
      <body className={`${sansFont.variable}  m-0 h-full p-0 font-sans`}>
        <FullPageErrorAlert message="不存在此页面" />
      </body>
    </html>
  )
}
