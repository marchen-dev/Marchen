import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className，后写的 Tailwind 工具类覆盖前者。
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
