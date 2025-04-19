'use client'
import { enableTurnstile, TURNSTILE_SITE_KEY } from '@marchen/lib'
import type { TurnstileCallbacks } from 'react-turnstile'
import ReactTurnstile from 'react-turnstile'

export const Turnstile: Component<{
  onVerify: TurnstileCallbacks['onVerify']
}> = (props) => {
  const { onVerify, className } = props
  if (!enableTurnstile) {
    return
  }
  return (
    <ReactTurnstile
      sitekey={TURNSTILE_SITE_KEY ?? ''}
      onVerify={onVerify}
      className={className}
      fixedSize
    />
  )
}
