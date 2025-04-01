import { FullPageErrorAlert } from '@base/components/common/FullPageErrorAlert'
import { sansFont, serifFont } from '@base/lib/fonts'
import { fetchAggregation } from '@domain/home/queries/aggregation-query'
import { redirect } from 'next/navigation'
import { PublicEnvScript } from 'next-runtime-env'

import { SiteLayout } from '~/layout/container/SiteLayout'
import Footer from '~/layout/footer/Footer'
import Header from '~/layout/header/Header'
import { Content } from '~/layout/main/Content'
import { WebAppProviders } from '~/providers/Providers'
import { AggregationDataProvider } from '~/providers/root/AggregationDataProvider'

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
      </head>
      <body
        className={`${sansFont.variable} ${serifFont.variable} font-sans antialiased`}
      >
        <WebAppProviders>
          <AggregationDataProvider value={aggregateData}>
            <SiteLayout>
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
