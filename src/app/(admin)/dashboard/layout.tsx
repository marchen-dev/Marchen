import type { PropsWithChildren } from 'react'

import { AuthLayout } from '~/layout/dashboard/AuthLayout'

export default function DashboardLayout(props: PropsWithChildren) {
  return <AuthLayout>{props.children}</AuthLayout>
}
