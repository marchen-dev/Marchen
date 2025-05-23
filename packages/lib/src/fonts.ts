import { Manrope, Noto_Serif_SC } from 'next/font/google'

const sansFont = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

const serifFont = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Noto Serif SC'],
})

export { sansFont, serifFont }
