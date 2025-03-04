import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'

import { Alert, AlertDescription, AlertTitle } from '../ui/Alert'
import { Button } from '../ui/Button'

export const FullPageErrorAlert: FC<{ message?: string }> = (props) => {
  const { message } = props
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Alert variant="destructive" className="mx-4 w-full sm:w-[500px]">
        <AlertCircle className="size-6" />
        <AlertTitle className="ml-2 text-xl">糟糕发生错误了 😭</AlertTitle>
        <AlertDescription className="ml-2 text-lg">
          {message ?? '发生了一个错误，请稍后再试。'}
        </AlertDescription>
      </Alert>
      <Link href="/">
        <Button variant="destructive">返回主页</Button>
      </Link>
    </div>
  )
}
