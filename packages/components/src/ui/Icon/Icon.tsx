import { cn } from '@marchen/lib'

interface IconProps {
  disabled?: boolean
  className?: string
  onClick?: () => void
}

const AIIcon = ({ disabled, className, onClick }: IconProps) => {
  return (
    <i
      className={cn(
        'icon-[mingcute--ai-line] cursor-pointer',
        disabled && 'cursor-not-allowed text-zinc-400',
        className,
      )}
      onClick={() => {
        if (disabled) return
        onClick?.()
      }}
    />
  )
}

export { AIIcon }
