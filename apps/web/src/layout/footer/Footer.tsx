'use client'
import { ExternalLink } from '@marchen/components/ui'
import Link from 'next/link'

import { useAggregationDataSelector } from '../../providers/root/AggregationDataProvider'
import { HeaderTools } from '../header/HeaderTools'

export default function Footer() {
  const username = useAggregationDataSelector((state) => state?.user.name)
  const site = useAggregationDataSelector((state) => state?.site)
  const pages = useAggregationDataSelector((state) => state?.page)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t bg-neutral-content px-2 py-6 text-sm md:px-0">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex flex-wrap gap-4">
              <strong>关于 &gt;</strong>
              {pages?.map((page) => (
                <Link
                  key={page.id}
                  href={page.slug}
                  className="transition-colors hover:text-secondary"
                >
                  {page.title}
                </Link>
              ))}
              <a
                href="https://github.com/marchen-dev/marchen"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-secondary"
              >
                关于此项目
              </a>
            </div>
            <p>
              @2025 - {currentYear} {username}
            </p>
            <div className="flex flex-col flex-wrap items-center gap-2.5 md:flex-row md:gap-1">
              <div>
                <span>Powered by </span>
                <ExternalLink href="https://github.com/marchen-dev/marchen">
                  Marchen
                </ExternalLink>
              </div>
              <span className="mx-1 hidden md:inline">|</span>
              <span>{site?.description}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <HeaderTools />
          </div>
        </div>
      </div>
    </footer>
  )
}
