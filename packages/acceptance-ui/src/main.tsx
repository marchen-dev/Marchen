import { createRoot } from 'react-dom/client'

import { App } from './app.tsx'
import './index.css'

const root = document.querySelector('#root')

if (!(root instanceof HTMLElement)) {
  throw new TypeError('缺少 #root')
}

createRoot(root).render(<App />)
