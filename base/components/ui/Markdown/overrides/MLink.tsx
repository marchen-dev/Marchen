'use client'

import { m } from 'framer-motion'

interface MLinkProps {
  children: React.ReactNode
  href: string
}

export const MLink = ({ children, ...props }: MLinkProps) => {
  return (
    <span className="px-0.5">
      <m.a
        className="relative  font-medium"
        target="_blank"
        rel="noreferrer"
        href={props.href}
        whileHover="hover"
      >
        {children}
        <m.span
          className="absolute bottom-px left-0 mx-0.5 h-px bg-black dark:bg-white"
          initial={{ width: '0%' }}
          variants={{
            hover: { width: '100%' },
          }}
          transition={{ duration: 0.2 }}
        />
      </m.a>
      <i className="icon-[mingcute--external-link-line] " />
    </span>
  )
}
