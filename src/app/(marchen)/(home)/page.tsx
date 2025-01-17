'use client'

import { useTheme } from 'next-themes'

export default function Home() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      123 你好啊十界
      <button
        className="btn"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        change
      </button>
    </div>
  )
}
