import { sansFont, serifFont } from '@base/lib/fonts'
import type { Metadata } from 'next'

import { MarchenAdminProviders } from '~/providers/Providers'

export const metadata: Metadata = {
  title: 'Marchen 管理面板',
  description: 'Marchen 管理面板',
}

export default function MarchenAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <body
        className={`${sansFont.variable} ${serifFont.variable} font-sans antialiased`}
      >
        <MarchenAdminProviders>{children}</MarchenAdminProviders>
      </body>
    </html>
  )
}
