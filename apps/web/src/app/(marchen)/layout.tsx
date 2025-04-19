import { HydratingDetector } from '@marchen/atom'
import { FullPageErrorAlert } from '@marchen/components/common'
import { sansFont, serifFont } from '@marchen/lib'
import { redirect } from 'next/navigation'
import { PublicEnvScript } from 'next-runtime-env'

import { SiteLayout } from '~/layout/container/SiteLayout'
import Footer from '~/layout/footer/Footer'
import Header from '~/layout/header/Header'
import { Content } from '~/layout/main/Content'
import { fetchAggregation } from '~/modules/home/queries/aggregation-query'
import { AggregationDataProvider } from '~/providers/root/AggregationDataProvider'

import { WebAppProviders } from '../../providers/Providers'

export const generateMetadata = async () => {
  const { site } = await fetchAggregation()
  return {
    title: {
      template: `%s | ${site.title}`,
      default: `${site.title} - ${site.description}`,
    },
    description: site.description,
    keywords: site.keywords?.join(',') || '',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const aggregateData = await fetchAggregation().catch((error) => {
    if (error.response?.status === 404) {
      return redirect('/setup')
    }
  })

  if (!aggregateData) {
    return (
      <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
        <head>
          <PublicEnvScript />
        </head>
        <body
          className={`${sansFont.variable} ${serifFont.variable} m-0 h-full p-0 font-sans`}
        >
          <FullPageErrorAlert message="无数据" />
        </body>
      </html>
    )
  }
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        <PublicEnvScript />
        <HydratingDetector />
      </head>
      <body
        className={`${sansFont.variable} ${serifFont.variable} font-sans antialiased`}
      >
        <WebAppProviders>
          <AggregationDataProvider value={aggregateData}>
            <SiteLayout>
              {children}
              <Header />
              <Content>{children}</Content>
              <Footer />
            </SiteLayout>
          </AggregationDataProvider>
        </WebAppProviders>
      </body>
    </html>
  )
}
