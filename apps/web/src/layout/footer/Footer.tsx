'use client'
import { ExternalLink } from '@marchen/components/ui'
import Link from 'next/link'

import { useAggregationDataSelector } from '../../providers/root/AggregationDataProvider'
import { HeaderTools } from '../header/HeaderTools'

export default function Footer() {
  const username = useAggregationDataSelector((state) => state?.user.name)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t bg-neutral-content py-6  text-sm">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-4">
            <strong>关于 &gt;</strong>
            <Link
              href="/about/me"
              className="transition-colors hover:text-secondary"
            >
              关于我
            </Link>
            <Link
              href="/about/project"
              className="transition-colors hover:text-secondary"
            >
              关于此项目
            </Link>
            <Link
              href="/about/site"
              className="transition-colors hover:text-secondary"
            >
              关于本站
            </Link>
          </div>
          <p>
            @2025 - {currentYear} {username}
          </p>
          <p className="flex flex-wrap items-center gap-1">
            <span>Powered by</span>
            <ExternalLink href="https://github.com/marchen-dev/marchen">
              Marchen
            </ExternalLink>
            <span className="mx-1">|</span>
            <span>有 2 个朋友正在访问此网站</span>
          </p>
        </div>
      </div>
      <HeaderTools />
    </footer>
  )
}
