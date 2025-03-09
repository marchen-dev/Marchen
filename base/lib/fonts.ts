import { Manrope, Noto_Sans_SC } from 'next/font/google'

const sansFont = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

const serifFont = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Noto Serif SC'],
})

export { sansFont, serifFont }
