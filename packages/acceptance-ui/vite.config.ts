import type { Plugin } from 'vite'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'

import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

/**
 * 仅 dev：灌入示例验收数据，并模拟 /health 与 /decision，方便本地点击签字。
 */
function acceptancePlayground(): Plugin {
  const assetsDir = path.resolve(import.meta.dirname, 'src/dev-assets')
  const files: Record<string, Buffer> = {
    '/rounds/1/assets/login.png': readFileSync(
      path.join(assetsDir, 'login.png'),
    ),
    '/rounds/1/assets/home.png': readFileSync(path.join(assetsDir, 'home.png')),
    '/rounds/2/assets/login.png': readFileSync(
      path.join(assetsDir, 'login.png'),
    ),
    '/rounds/2/assets/home.png': readFileSync(path.join(assetsDir, 'home.png')),
  }
  const payload = {
    requirement: '人能对着截图逐项打回，没有待修改时才能整单接受。',
    rounds: [
      {
        index: 1,
        title: '第一轮',
        conclusion: '登录按钮需要继续调整。',
        verdict: 'fail',
        humanDecision: {
          status: 'rejected',
          items: [
            {
              id: 'login',
              comment: '按钮在截图里不够醒目，请提高对比度。',
              images: [],
            },
          ],
        },
        cases: [
          {
            id: 'login',
            name: '登录按钮',
            status: 'fail',
            observation: '主按钮对比度不够，示例里标成未通过。',
            evidence: [{ path: 'rounds/1/assets/login.png', type: 'image' }],
          },
        ],
      },
      {
        index: 2,
        title: '第二轮',
        conclusion: '核心交互可验收。',
        verdict: 'pass',
        humanDecision: null,
        cases: [
          {
            id: 'login',
            name: '登录按钮',
            status: 'pass',
            observation: '按钮尺寸保持不变，对比度已经提高。',
            evidence: [
              { path: 'rounds/2/assets/login.png', type: 'image' },
              { path: 'rounds/2/assets/home.png', type: 'image' },
            ],
          },
          {
            id: 'history',
            name: '跨轮验收记录',
            status: 'pass',
            observation: '上一轮 AI 检查与人工意见按案例 ID 串联。',
            evidence: [{ path: 'rounds/2/assets/home.png', type: 'image' }],
          },
        ],
      },
    ],
  }
  let decision: {
    status: 'pending' | 'accepted' | 'rejected'
    items: Array<{ id: string; comment: string; images: string[] }>
  } = {
    status: 'pending',
    items: [
      {
        id: 'login',
        comment: '**主按钮**文字与背景的对比度仍然不够。',
        images: [],
      },
    ],
  }

  return {
    name: 'acceptance-playground',
    apply: 'serve',
    transformIndexHtml(html) {
      const json = JSON.stringify({ ...payload, decision }).replace(
        /</g,
        '\\u003c',
      )
      return html.replace(
        /<script type="application\/json" id="acceptance-data"><\/script>/,
        `<script type="application/json" id="acceptance-data">${json}</script>`,
      )
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://127.0.0.1')
        const asset = files[url.pathname]
        if (asset && req.method === 'GET') {
          res.setHeader('content-type', 'image/png')
          res.end(asset)
          return
        }
        if (url.pathname === '/health' && req.method === 'GET') {
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.end('{"ok":true}\n')
          return
        }
        if (url.pathname !== '/decision') {
          next()
          return
        }
        if (req.method === 'GET') {
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.end(`${JSON.stringify(decision)}\n`)
          return
        }
        if (req.method !== 'POST') {
          next()
          return
        }
        const chunks: Buffer[] = []
        req.on('data', (chunk) => {
          chunks.push(chunk as Buffer)
        })
        req.on('end', () => {
          try {
            const body = JSON.parse(
              Buffer.concat(chunks).toString('utf-8'),
            ) as {
              status?: string
              items?: unknown
            }
            const status = body.status
            if (
              status !== 'pending' &&
              status !== 'accepted' &&
              status !== 'rejected'
            ) {
              res.statusCode = 400
              res.end('{"error":"非法状态"}\n')
              return
            }
            const items = normalizePlaygroundItems(body.items)
            if (status === 'accepted' && items.length > 0) {
              res.statusCode = 400
              res.end('{"error":"有待修改项时不能接受"}\n')
              return
            }
            if (status === 'rejected') {
              if (items.length === 0) {
                res.statusCode = 400
                res.end('{"error":"没有待修改项时不能让 AI 修改"}\n')
                return
              }
              if (items.some((item) => item.comment.trim() === '')) {
                res.statusCode = 400
                res.end('{"error":"待修改项必须填写评语"}\n')
                return
              }
            }
            decision = { status, items }
            res.setHeader('content-type', 'application/json; charset=utf-8')
            res.end(`${JSON.stringify(decision)}\n`)
          } catch {
            res.statusCode = 400
            res.end('{"error":"JSON 无效"}\n')
          }
        })
      })
    },
  }
}

function normalizePlaygroundItems(raw: unknown): Array<{
  id: string
  comment: string
  images: string[]
}> {
  if (!Array.isArray(raw)) return []
  return raw.map((entry) => {
    const row = (entry ?? {}) as Record<string, unknown>
    const images = Array.isArray(row.images)
      ? row.images.filter((item): item is string => typeof item === 'string')
      : []
    const incoming = Array.isArray(row.newImages) ? row.newImages : []
    for (const image of incoming) {
      const obj = (image ?? {}) as Record<string, unknown>
      const mime = String(obj.mime ?? 'image/png')
      const data = String(obj.data ?? '')
      if (data) images.push(`data:${mime};base64,${data}`)
    }
    return {
      id: String(row.id ?? ''),
      comment: String(row.comment ?? ''),
      images,
    }
  })
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile(), acceptancePlayground()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})
