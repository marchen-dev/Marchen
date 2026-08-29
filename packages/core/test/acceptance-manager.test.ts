import { Buffer } from 'node:buffer'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  ACCEPTANCE_DECISION_ASSET_MAX_BYTES,
  ACCEPTANCE_DECISION_FILE,
  ValidationError,
} from '@marchen/shared'
import { afterEach, describe, expect, it } from 'vitest'
import { AcceptanceManager, Workspace } from '../src/index.js'

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'marchen-acc-'))
  mkdirSync(join(root, 'marchen', 'changes'), { recursive: true })
  return root
}

const PNG_1X1 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

function seedChange(root: string, name: string): string {
  const changeDir = join(root, 'marchen', 'changes', name)
  mkdirSync(changeDir, { recursive: true })
  return changeDir
}

describe('decision 读写', () => {
  it('rejected 缺待修改项会拒绝写入', async () => {
    const root = fixtureRoot()
    seedChange(root, 'foo')
    const manager = new AcceptanceManager(new Workspace(root))
    await expect(
      manager.writeDecision('foo', {
        status: 'rejected',
        items: [],
      }),
    ).rejects.toThrow(ValidationError)
  })

  it('rejected 空评语会拒绝写入', async () => {
    const root = fixtureRoot()
    seedChange(root, 'foo')
    const manager = new AcceptanceManager(new Workspace(root))
    await expect(
      manager.writeDecision('foo', {
        status: 'rejected',
        items: [{ id: 'login', comment: '  ', images: [] }],
      }),
    ).rejects.toThrow(ValidationError)
  })

  it('accepted 带待修改项会拒绝写入', async () => {
    const root = fixtureRoot()
    seedChange(root, 'foo')
    const manager = new AcceptanceManager(new Workspace(root))
    await expect(
      manager.writeDecision('foo', {
        status: 'accepted',
        items: [{ id: 'login', comment: '对比度', images: [] }],
      }),
    ).rejects.toThrow(ValidationError)
  })

  it('pending 可以边攒待修改', async () => {
    const root = fixtureRoot()
    seedChange(root, 'foo')
    const manager = new AcceptanceManager(new Workspace(root))
    await manager.writeDecision('foo', {
      status: 'pending',
      items: [{ id: 'login', comment: '对比度', images: [] }],
    })
    const read = await manager.readDecision('foo')
    expect(read).toEqual({
      status: 'pending',
      items: [{ id: 'login', comment: '对比度', images: [] }],
    })
  })

  it('接受可以无待修改项', async () => {
    const root = fixtureRoot()
    seedChange(root, 'foo')
    const manager = new AcceptanceManager(new Workspace(root))
    await manager.writeDecision('foo', {
      status: 'accepted',
      items: [],
    })
    const read = await manager.readDecision('foo')
    expect(read?.status).toBe('accepted')
    expect(read?.items).toEqual([])
  })

  it('写入只出 decision.json', async () => {
    const root = fixtureRoot()
    const changeDir = seedChange(root, 'foo')
    const manager = new AcceptanceManager(new Workspace(root))
    await manager.writeDecision('foo', { status: 'pending', items: [] })
    const { existsSync } = await import('node:fs')
    expect(existsSync(join(changeDir, 'acceptance', 'decision.json'))).toBe(
      true,
    )
    expect(existsSync(join(changeDir, 'acceptance', 'decision.md'))).toBe(false)
  })

  it('读取旧 decision.md：空评语得到空 items', async () => {
    const root = fixtureRoot()
    const changeDir = seedChange(root, 'foo')
    const { mkdirSync, writeFileSync } = await import('node:fs')
    mkdirSync(join(changeDir, 'acceptance'), { recursive: true })
    writeFileSync(
      join(changeDir, 'acceptance', 'decision.md'),
      `## 状态

accepted

## 评语

## 逐项

`,
    )
    const manager = new AcceptanceManager(new Workspace(root))
    const read = await manager.readDecision('foo')
    expect(read).toEqual({ status: 'accepted', items: [] })
  })

  it('读取旧 decision.md：评语变成一条待修改', async () => {
    const root = fixtureRoot()
    const changeDir = seedChange(root, 'foo')
    const { mkdirSync, writeFileSync } = await import('node:fs')
    mkdirSync(join(changeDir, 'acceptance'), { recursive: true })
    writeFileSync(
      join(changeDir, 'acceptance', 'decision.md'),
      `## 状态

rejected

## 评语

按钮太淡

## 逐项

`,
    )
    const manager = new AcceptanceManager(new Workspace(root))
    const read = await manager.readDecision('foo')
    expect(read).toEqual({
      status: 'rejected',
      items: [{ id: 'legacy', comment: '按钮太淡', images: [] }],
    })
  })

  it('requirement 只写一次', async () => {
    const root = fixtureRoot()
    seedChange(root, 'foo')
    const manager = new AcceptanceManager(new Workspace(root))
    await manager.writeRequirementOnce('foo', '第一句')
    await manager.writeRequirementOnce('foo', '第二句')
    expect(await manager.readRequirement('foo')).toBe('第一句')
  })
})

describe('render', () => {
  it('把截图收成相对 rounds/ 的路径，且不改 result.json', async () => {
    const root = fixtureRoot()
    const changeDir = seedChange(root, 'foo')
    const assets = join(changeDir, 'acceptance', 'rounds', '1', 'assets')
    mkdirSync(assets, { recursive: true })
    writeFileSync(join(assets, 'cron.png'), 'fake')
    writeFileSync(
      join(changeDir, 'acceptance', 'rounds', '1', 'result.json'),
      JSON.stringify({
        title: 'Cron',
        summary: { verdict: 'pass', conclusion: '能看' },
        cases: [
          {
            id: 'cron',
            name: '工作日九点',
            status: 'pass',
            observation: '对了',
            evidence: ['assets/cron.png'],
          },
        ],
      }),
    )
    const manager = new AcceptanceManager(new Workspace(root))
    await manager.writeRequirementOnce('foo', '目标')
    const page = await manager.render('foo')
    const { readFileSync } = await import('node:fs')
    const html = readFileSync(page, 'utf-8')
    expect(html).toContain('id="acceptance-data"')
    expect(html).toContain('rounds/1/assets/cron.png')
    expect(html).not.toContain('http://127.0.0.1')
    expect(html).not.toContain('__ACCEPTANCE_DATA__')
    const resultOnDisk = JSON.parse(
      readFileSync(
        join(changeDir, 'acceptance', 'rounds', '1', 'result.json'),
        'utf-8',
      ),
    ) as { cases: Array<{ evidence: string[] }> }
    expect(resultOnDisk.cases[0]?.evidence).toEqual(['assets/cron.png'])
  })

  it('回灌每轮人工决定，缺失时保持为 null', async () => {
    const root = fixtureRoot()
    const changeDir = seedChange(root, 'foo')
    const firstRound = join(changeDir, 'acceptance', 'rounds', '1')
    const secondRound = join(changeDir, 'acceptance', 'rounds', '2')
    mkdirSync(firstRound, { recursive: true })
    mkdirSync(secondRound, { recursive: true })
    writeFileSync(
      join(firstRound, 'result.json'),
      JSON.stringify({
        title: '第一轮',
        cases: [{ id: 'login', name: '登录按钮', status: 'fail' }],
      }),
    )
    writeFileSync(
      join(firstRound, 'human-decision.json'),
      JSON.stringify({
        status: 'rejected',
        items: [
          {
            id: 'login',
            comment: '按钮对比度不足',
            images: ['decision-assets/contrast.png'],
          },
        ],
      }),
    )
    writeFileSync(
      join(secondRound, 'result.json'),
      JSON.stringify({
        title: '第二轮',
        cases: [{ id: 'login', name: '登录按钮', status: 'pass' }],
      }),
    )

    const manager = new AcceptanceManager(new Workspace(root))
    const page = await manager.render('foo')
    const { readFileSync } = await import('node:fs')
    const html = readFileSync(page, 'utf-8')

    expect(html).toContain(
      '"humanDecision":{"status":"rejected","items":[{"id":"login","comment":"按钮对比度不足","images":["decision-assets/contrast.png"]}]}',
    )
    expect(html).toContain('"index":2')
    expect(html).toContain('"humanDecision":null')
  })
})

describe('serve', () => {
  const closers: Array<() => Promise<void>> = []
  afterEach(async () => {
    while (closers.length > 0) {
      await closers.pop()?.()
    }
  })

  async function boot() {
    const root = fixtureRoot()
    seedChange(root, 'foo')
    const manager = new AcceptanceManager(new Workspace(root))
    await manager.writeRequirementOnce('foo', '目标')
    await manager.render('foo')
    const served = await manager.serve('foo', { attachSignals: false })
    closers.push(served.close)
    return { manager, served }
  }

  it('只绑回环且 /health 可用', async () => {
    const { served } = await boot()
    const health = await fetch(`http://127.0.0.1:${served.port}/health`)
    expect(health.ok).toBe(true)
    expect(served.url).toContain('127.0.0.1')
    expect(served.url).toContain('t=')
  })

  it('无 token 不能写决定', async () => {
    const { manager, served } = await boot()
    const res = await fetch(`http://127.0.0.1:${served.port}/decision`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    })
    expect(res.status).toBe(401)
    expect((await manager.readDecision('foo'))?.status).toBe('pending')
  })

  it('路径穿越被拒绝', async () => {
    const { served } = await boot()
    const res = await fetch(`http://127.0.0.1:${served.port}/../tasks.md`)
    expect([403, 404]).toContain(res.status)
  })

  it('打回空待修改返回 400', async () => {
    const { manager, served } = await boot()
    const posted = await fetch(
      `http://127.0.0.1:${served.port}/decision?t=${served.token}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', items: [] }),
      },
    )
    expect(posted.status).toBe(400)
    const decision = await manager.readDecision('foo')
    expect(decision?.status).not.toBe('rejected')
  })

  it('get /decision 返回 JSON 文档', async () => {
    const { served } = await boot()
    const res = await fetch(
      `http://127.0.0.1:${served.port}/decision?t=${served.token}`,
    )
    expect(res.ok).toBe(true)
    expect(res.headers.get('content-type')).toContain('application/json')
    const body = (await res.json()) as { status: string; items: unknown[] }
    expect(body.status).toBe('pending')
    expect(body.items).toEqual([])
  })

  it('已接受决定可以撤回为 pending', async () => {
    const { manager, served } = await boot()
    const endpoint = `http://127.0.0.1:${served.port}/decision?t=${served.token}`
    const options = (status: 'accepted' | 'pending') => ({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status, items: [] }),
    })

    expect((await fetch(endpoint, options('accepted'))).ok).toBe(true)
    expect((await manager.readDecision('foo'))?.status).toBe('accepted')

    expect((await fetch(endpoint, options('pending'))).ok).toBe(true)
    expect(await manager.readDecision('foo')).toEqual({
      status: 'pending',
      items: [],
    })
  })

  it('accepted 带待修改项返回 400', async () => {
    const { manager, served } = await boot()
    const posted = await fetch(
      `http://127.0.0.1:${served.port}/decision?t=${served.token}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          items: [{ id: 'login', comment: '对比度', images: [] }],
        }),
      },
    )
    expect(posted.status).toBe(400)
    expect((await manager.readDecision('foo'))?.status).not.toBe('accepted')
  })

  it('附图落到 decision-assets 且 json 不含字节', async () => {
    const { manager, served } = await boot()
    const posted = await fetch(
      `http://127.0.0.1:${served.port}/decision?t=${served.token}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'pending',
          items: [
            {
              id: 'login',
              comment: '对比度',
              newImages: [{ mime: 'image/png', data: PNG_1X1 }],
            },
          ],
        }),
      },
    )
    expect(posted.status).toBe(200)
    const decision = await manager.readDecision('foo')
    expect(decision?.items[0]?.images[0]).toMatch(
      /^decision-assets\/[a-f0-9]+\.png$/,
    )
    const raw = posted.headers.get('content-type')
    expect(raw).toContain('application/json')
    const body = (await posted.json()) as {
      items: Array<{ images: string[] }>
    }
    expect(JSON.stringify(body)).not.toContain(PNG_1X1)
    const root = manager.dir('foo')
    const { existsSync, readFileSync } = await import('node:fs')
    const rel = decision?.items[0]?.images[0] ?? ''
    expect(existsSync(join(root, rel))).toBe(true)
    expect(
      readFileSync(join(root, ACCEPTANCE_DECISION_FILE), 'utf-8'),
    ).not.toContain('newImages')
  })

  it('非法 MIME 拒绝写入', async () => {
    const { manager, served } = await boot()
    const posted = await fetch(
      `http://127.0.0.1:${served.port}/decision?t=${served.token}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'pending',
          items: [
            {
              id: 'login',
              comment: 'x',
              newImages: [{ mime: 'image/svg+xml', data: 'PHN2Zz4=' }],
            },
          ],
        }),
      },
    )
    expect(posted.status).toBe(400)
    expect((await manager.readDecision('foo'))?.items).toEqual([])
  })

  it('超限附图拒绝写入', async () => {
    const { manager, served } = await boot()
    const posted = await fetch(
      `http://127.0.0.1:${served.port}/decision?t=${served.token}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'pending',
          items: [
            {
              id: 'login',
              comment: 'x',
              newImages: [
                {
                  mime: 'image/png',
                  data: Buffer.alloc(
                    ACCEPTANCE_DECISION_ASSET_MAX_BYTES + 1,
                  ).toString('base64'),
                },
              ],
            },
          ],
        }),
      },
    )
    expect(posted.status).toBe(400)
    expect((await manager.readDecision('foo'))?.items).toEqual([])
  })

  it('没有 acceptance 夹时 status 不是 accepted', async () => {
    const root = fixtureRoot()
    seedChange(root, 'bar')
    const manager = new AcceptanceManager(new Workspace(root))
    const status = await manager.status('bar')
    expect(status.exists).toBe(false)
    expect(status.decision).toBeNull()
  })
})
