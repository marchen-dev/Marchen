import { apiClient } from '@base/services'
import type { PropsWithChildren } from 'react'

export const AuthLayout: React.FC<PropsWithChildren> = async (props) => {
  await apiClient.user.get()
  return <div>{props.children}</div>
}
