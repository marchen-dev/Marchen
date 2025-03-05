import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'

import { PortalLayout } from '~/layout/dashboard/PortalLayout'

export const metadata: Metadata = {
  title: '登录',
}
export default async function LoginLayout(props: PropsWithChildren) {
  return <PortalLayout title="登录">{props.children}</PortalLayout>
}
