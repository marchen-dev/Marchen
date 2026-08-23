import type {
  AcceptanceDecision,
  AcceptanceDecisionItem,
  AcceptanceRoundSummary,
  AcceptanceServeResult,
  AcceptanceStatusResult,
  DecisionStatus,
} from '@marchen/shared'
import type { Workspace } from './workspace.js'
import { Buffer } from 'node:buffer'
import { randomBytes } from 'node:crypto'
import { createServer } from 'node:http'
import { extname, join, relative, resolve, sep } from 'node:path'
import { ACCEPTANCE_PAGE_TEMPLATE } from '@marchen/config'
import {
  ensureDir,
  exists,
  listDir,
  readFile,
  removeFile,
  writeBinary,
  writeFile,
} from '@marchen/fs'
import {
  ACCEPTANCE_DECISION_ASSET_MAX_BYTES,
  ACCEPTANCE_DECISION_ASSETS_DIRECTORY,
  ACCEPTANCE_DECISION_FILE,
  ACCEPTANCE_DEFAULT_PORT,
  ACCEPTANCE_DIRECTORY_NAME,
  ACCEPTANCE_LEGACY_DECISION_FILE,
  ACCEPTANCE_MAX_PORT,
  ACCEPTANCE_PAGE_FILE,
  ACCEPTANCE_REQUIREMENT_FILE,
  ACCEPTANCE_ROUNDS_DIRECTORY,
  ACCEPTANCE_SERVE_LOCK_FILE,
  ValidationError,
} from '@marchen/shared'

const EMPTY_DECISION: AcceptanceDecision = {
  status: 'pending',
  items: [],
}

interface ServeLock {
  readonly pid: number
  readonly port: number
  readonly token: string
  readonly name: string
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
}

/**
 * 验收附属夹：读写决定、灌页、本机签字服务
 */
export class AcceptanceManager {
  constructor(private readonly workspace: Workspace) {}

  /** 变更的 acceptance 绝对路径 */
  dir(name: string): string {
    return join(this.workspace.changeDir, name, ACCEPTANCE_DIRECTORY_NAME)
  }

  async hasDir(name: string): Promise<boolean> {
    return await exists(this.dir(name))
  }

  parseDecision(text: string): AcceptanceDecision {
    return parseDecisionJson(text) ?? parseLegacyDecision(text)
  }

  serializeDecision(decision: AcceptanceDecision): string {
    return `${JSON.stringify(
      {
        status: decision.status,
        items: decision.items.map((item) => ({
          id: item.id,
          comment: item.comment,
          images: [...item.images],
        })),
      },
      null,
      2,
    )}\n`
  }

  async readDecision(name: string): Promise<AcceptanceDecision | null> {
    const root = this.dir(name)
    const jsonPath = join(root, ACCEPTANCE_DECISION_FILE)
    if (await exists(jsonPath)) {
      return parseDecisionJson(await readFile(jsonPath)) ?? EMPTY_DECISION
    }
    const legacyPath = join(root, ACCEPTANCE_LEGACY_DECISION_FILE)
    if (await exists(legacyPath)) {
      return parseLegacyDecision(await readFile(legacyPath))
    }
    return null
  }

  /**
   * 写入人的决定。accepted 不得带待修改项；rejected 必须每项都有评语。
   */
  async writeDecision(
    name: string,
    decision: AcceptanceDecision,
  ): Promise<void> {
    assertWritableDecision(decision)
    await writeFile(
      join(this.dir(name), ACCEPTANCE_DECISION_FILE),
      this.serializeDecision(decision),
    )
  }

  /** 先落附图再写 decision.json */
  private async persistPreparedDecision(
    name: string,
    prepared: PreparedDecision,
  ): Promise<void> {
    const root = this.dir(name)
    for (const asset of prepared.assets) {
      await writeBinary(join(root, asset.relativePath), asset.bytes)
    }
    await this.writeDecision(name, prepared.decision)
  }

  async readRequirement(name: string): Promise<string | null> {
    const path = join(this.dir(name), ACCEPTANCE_REQUIREMENT_FILE)
    if (!(await exists(path))) return null
    return (await readFile(path)).trim()
  }

  /** 只在文件还不存在时写入，保证目标不可变 */
  async writeRequirementOnce(name: string, text: string): Promise<void> {
    const path = join(this.dir(name), ACCEPTANCE_REQUIREMENT_FILE)
    if (await exists(path)) return
    await writeFile(path, `${text.trim()}\n`)
  }

  async listRoundIndexes(name: string): Promise<number[]> {
    const roundsDir = join(this.dir(name), ACCEPTANCE_ROUNDS_DIRECTORY)
    if (!(await exists(roundsDir))) return []
    const entries = await listDir(roundsDir)
    return entries
      .map((entry) => Number(entry))
      .filter((n) => Number.isInteger(n) && n > 0)
      .sort((a, b) => a - b)
  }

  async readRoundJson(
    name: string,
    index: number,
  ): Promise<Record<string, unknown> | null> {
    const path = join(
      this.dir(name),
      ACCEPTANCE_ROUNDS_DIRECTORY,
      String(index),
      'result.json',
    )
    if (!(await exists(path))) return null
    try {
      return JSON.parse(await readFile(path)) as Record<string, unknown>
    } catch {
      return null
    }
  }

  async readRoundDecision(
    name: string,
    index: number,
  ): Promise<AcceptanceDecision | null> {
    const path = join(
      this.dir(name),
      ACCEPTANCE_ROUNDS_DIRECTORY,
      String(index),
      'human-decision.json',
    )
    if (!(await exists(path))) return null
    return parseDecisionJson(await readFile(path))
  }

  async status(name: string): Promise<AcceptanceStatusResult> {
    const present = await this.hasDir(name)
    if (!present) {
      return {
        name,
        exists: false,
        requirement: null,
        decision: null,
        roundCount: 0,
        rounds: [],
        serving: false,
        url: null,
      }
    }

    const indexes = await this.listRoundIndexes(name)
    const rounds: AcceptanceRoundSummary[] = []
    for (const index of indexes) {
      const result = await this.readRoundJson(name, index)
      const summary = (result?.summary ?? {}) as Record<string, unknown>
      rounds.push({
        index,
        title: String(result?.title ?? ''),
        verdict: String(summary.verdict ?? ''),
        conclusion: String(summary.conclusion ?? ''),
        result,
        humanDecision: await this.readRoundDecision(name, index),
      })
    }

    const lock = await this.readLock(name)
    const serving = lock != null && isAlive(lock.pid)

    return {
      name,
      exists: true,
      requirement: await this.readRequirement(name),
      decision: await this.readDecision(name),
      roundCount: indexes.length,
      rounds,
      serving,
      url: serving && lock ? publicUrl(lock.port, lock.token) : null,
    }
  }

  /**
   * 把 requirement / decision / 各轮嵌进冻模版，写出 index.html
   */
  async render(name: string): Promise<string> {
    const root = this.dir(name)
    await ensureDir(root)
    const decision = (await this.readDecision(name)) ?? EMPTY_DECISION
    const indexes = await this.listRoundIndexes(name)
    const rounds = []
    for (const index of indexes) {
      const result = (await this.readRoundJson(name, index)) ?? {}
      const summary = (result.summary ?? {}) as Record<string, unknown>
      const rawCases = Array.isArray(result.cases) ? result.cases : []
      const cases = rawCases.map((item) => normalizeCase(item, index))
      rounds.push({
        index,
        title: String(result.title ?? ''),
        conclusion: String(summary.conclusion ?? ''),
        verdict: String(summary.verdict ?? ''),
        cases,
        humanDecision: await this.readRoundDecision(name, index),
      })
    }

    const payload = {
      requirement: (await this.readRequirement(name)) ?? '',
      decision,
      rounds,
    }
    const json = JSON.stringify(payload).replace(/</g, '\\u003c')
    const html = injectAcceptanceData(ACCEPTANCE_PAGE_TEMPLATE, json)
    const out = join(root, ACCEPTANCE_PAGE_FILE)
    await writeFile(out, html)
    return out
  }

  async serve(
    name: string,
    options?: { port?: number; attachSignals?: boolean },
  ): Promise<AcceptanceServeResult & { close: () => Promise<void> }> {
    if (!(await exists(join(this.workspace.changeDir, name)))) {
      throw new ValidationError(`变更 "${name}" 不存在`)
    }

    const existing = await this.findLiveLock()
    if (existing && existing.name === name && isAlive(existing.pid)) {
      return {
        name,
        url: publicUrl(existing.port, existing.token),
        port: existing.port,
        token: existing.token,
        reused: true,
        close: async () => {
          await this.stop(name)
        },
      }
    }
    if (existing && existing.name !== name && isAlive(existing.pid)) {
      await this.stop(existing.name)
    }

    const root = this.dir(name)
    await ensureDir(root)
    if (!(await exists(join(root, ACCEPTANCE_PAGE_FILE)))) {
      await this.render(name)
    }
    if (!(await this.readDecision(name))) {
      await this.writeDecision(name, EMPTY_DECISION)
    }

    const token = randomBytes(16).toString('hex')
    const preferred = options?.port ?? ACCEPTANCE_DEFAULT_PORT
    const { server, port } = await listenLoopback(preferred)

    server.on('request', (req, res) => {
      void this.handleRequest(name, token, req, res)
    })

    const lock: ServeLock = { pid: process.pid, port, token, name }
    await this.writeLock(name, lock)

    const close = async (): Promise<void> => {
      await new Promise<void>((resolveClose) => {
        server.close(() => resolveClose())
      })
      await this.clearLock(name)
    }

    if (options?.attachSignals !== false) {
      const onSignal = (): void => {
        void close().finally(() => process.exit(0))
      }
      process.once('SIGINT', onSignal)
      process.once('SIGTERM', onSignal)
    }

    return {
      name,
      url: publicUrl(port, token),
      port,
      token,
      reused: false,
      close,
    }
  }

  /**
   * 停掉该变更（或工作区里正在跑的）serve。没有进程时不报错。
   */
  async stop(name?: string): Promise<boolean> {
    const lock = name ? await this.readLock(name) : await this.findLiveLock()
    if (!lock) return false
    if (isAlive(lock.pid) && lock.pid !== process.pid) {
      try {
        process.kill(lock.pid, 'SIGTERM')
      } catch {
        // 进程已经没了
      }
    }
    await this.clearLock(lock.name)
    return true
  }

  private async handleRequest(
    name: string,
    token: string,
    req: import('node:http').IncomingMessage,
    res: import('node:http').ServerResponse,
  ): Promise<void> {
    const host = `http://127.0.0.1`
    const url = new URL(req.url ?? '/', host)
    const method = req.method ?? 'GET'

    if (method === 'GET' && url.pathname === '/health') {
      json(res, 200, { ok: true })
      return
    }

    if (url.pathname === '/decision') {
      if (!checkToken(url, req, token)) {
        json(res, 401, { error: '缺少或错误的 token' })
        return
      }
      if (method === 'GET') {
        const decision = (await this.readDecision(name)) ?? EMPTY_DECISION
        json(res, 200, decision)
        return
      }
      if (method === 'POST') {
        const body = await readBody(req)
        let parsed: { status?: string; items?: unknown }
        try {
          parsed = JSON.parse(body) as { status?: string; items?: unknown }
        } catch {
          json(res, 400, { error: 'JSON 无效' })
          return
        }
        const status = parsed.status
        if (
          status !== 'accepted' &&
          status !== 'rejected' &&
          status !== 'pending'
        ) {
          json(res, 400, { error: '非法状态' })
          return
        }
        let prepared: PreparedDecision
        try {
          prepared = preparePostedDecision(status, parsed.items)
          assertWritableDecision(prepared.decision)
        } catch (error) {
          json(res, 400, {
            error: error instanceof Error ? error.message : '写入失败',
          })
          return
        }
        try {
          await this.persistPreparedDecision(name, prepared)
        } catch (error) {
          json(res, 400, {
            error: error instanceof Error ? error.message : '写入失败',
          })
          return
        }
        try {
          await this.render(name)
        } catch {
          // 烤失败不否定这次签字
        }
        json(res, 200, prepared.decision)
        return
      }
    }

    if (method === 'GET') {
      const served = await this.tryStatic(name, url.pathname, res)
      if (served) return
    }

    json(res, 404, { error: 'not found' })
  }

  private async tryStatic(
    name: string,
    pathname: string,
    res: import('node:http').ServerResponse,
  ): Promise<boolean> {
    const root = resolve(this.dir(name))
    const rel =
      pathname === '/' ? ACCEPTANCE_PAGE_FILE : pathname.replace(/^\/+/, '')
    const target = resolve(root, rel)
    const bound = relative(root, target)
    if (bound.startsWith('..') || bound.split(sep).includes('..')) {
      json(res, 403, { error: 'forbidden' })
      return true
    }
    if (!(await exists(target))) return false
    const { readFile: readBytes } = await import('node:fs/promises')
    let body: Buffer
    try {
      body = await readBytes(target)
    } catch {
      return false
    }
    const type =
      MIME[extname(target).toLowerCase()] ?? 'application/octet-stream'
    res.writeHead(200, { 'content-type': type })
    res.end(body)
    return true
  }

  private lockPath(name: string): string {
    return join(this.dir(name), ACCEPTANCE_SERVE_LOCK_FILE)
  }

  private async writeLock(name: string, lock: ServeLock): Promise<void> {
    await writeFile(this.lockPath(name), `${JSON.stringify(lock)}\n`)
  }

  private async readLock(name: string): Promise<ServeLock | null> {
    const path = this.lockPath(name)
    if (!(await exists(path))) return null
    try {
      return JSON.parse(await readFile(path)) as ServeLock
    } catch {
      return null
    }
  }

  private async clearLock(name: string): Promise<void> {
    await removeFile(this.lockPath(name))
  }

  private async findLiveLock(): Promise<ServeLock | null> {
    if (!(await exists(this.workspace.changeDir))) return null
    let names: string[] = []
    try {
      names = await listDir(this.workspace.changeDir)
    } catch {
      return null
    }
    for (const name of names) {
      const lock = await this.readLock(name)
      if (lock && isAlive(lock.pid)) return lock
    }
    return null
  }
}

interface PreparedDecision {
  readonly decision: AcceptanceDecision
  readonly assets: ReadonlyArray<{
    readonly relativePath: string
    readonly bytes: Buffer
  }>
}

const ASSET_MIME_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

const DATA_SCRIPT =
  /<script type="application\/json" id="acceptance-data">[\s\S]*?<\/script>/

function injectAcceptanceData(template: string, json: string): string {
  if (DATA_SCRIPT.test(template)) {
    return template.replace(
      DATA_SCRIPT,
      `<script type="application/json" id="acceptance-data">${json}</script>`,
    )
  }
  return `${template}<script type="application/json" id="acceptance-data">${json}</script>`
}

function preparePostedDecision(
  status: DecisionStatus,
  rawItems: unknown,
): PreparedDecision {
  if (!Array.isArray(rawItems) && rawItems != null) {
    throw new ValidationError('items 必须是数组')
  }
  const assets: Array<{ relativePath: string; bytes: Buffer }> = []
  const items: AcceptanceDecisionItem[] = []
  for (const entry of Array.isArray(rawItems) ? rawItems : []) {
    const row = (entry ?? {}) as Record<string, unknown>
    const images = collectItemImages(row, assets)
    items.push({
      id: String(row.id ?? ''),
      comment: String(row.comment ?? ''),
      images,
    })
  }
  return { decision: { status, items }, assets }
}

function collectItemImages(
  row: Record<string, unknown>,
  assets: Array<{ relativePath: string; bytes: Buffer }>,
): string[] {
  const kept = Array.isArray(row.images)
    ? row.images.filter(
        (item): item is string =>
          typeof item === 'string' && isSafeAssetPath(item),
      )
    : []
  const incoming = Array.isArray(row.newImages) ? row.newImages : []
  const added: string[] = []
  for (const raw of incoming) {
    const image = (raw ?? {}) as Record<string, unknown>
    const mime = String(image.mime ?? '')
    const ext = ASSET_MIME_EXT[mime]
    if (!ext) {
      throw new ValidationError('附图格式只支持 png / jpeg / webp / gif')
    }
    const bytes = decodeImageData(String(image.data ?? ''))
    if (bytes.byteLength === 0) {
      throw new ValidationError('附图内容为空')
    }
    if (bytes.byteLength > ACCEPTANCE_DECISION_ASSET_MAX_BYTES) {
      throw new ValidationError('附图超过 5MB')
    }
    const relativePath = `${ACCEPTANCE_DECISION_ASSETS_DIRECTORY}/${randomBytes(8).toString('hex')}${ext}`
    assets.push({ relativePath, bytes })
    added.push(relativePath)
  }
  return [...kept, ...added]
}

function decodeImageData(data: string): Buffer {
  const trimmed = data.trim()
  const comma = trimmed.indexOf(',')
  const payload =
    trimmed.startsWith('data:') && comma >= 0
      ? trimmed.slice(comma + 1)
      : trimmed
  return Buffer.from(payload, 'base64')
}

function isSafeAssetPath(path: string): boolean {
  return (
    path.startsWith(`${ACCEPTANCE_DECISION_ASSETS_DIRECTORY}/`) &&
    !path.includes('..') &&
    !path.includes('\\') &&
    path.split('/').length === 2
  )
}

function parseDecisionJson(text: string): AcceptanceDecision | null {
  try {
    const raw = JSON.parse(text) as { status?: unknown; items?: unknown }
    if (raw == null || typeof raw !== 'object') return null
    return {
      status: asDecisionStatus(raw.status),
      items: normalizeItems(raw.items),
    }
  } catch {
    return null
  }
}

function parseLegacyDecision(text: string): AcceptanceDecision {
  const statusRaw = section(text, '状态').trim().split(/\s+/)[0] ?? ''
  const status = asDecisionStatus(statusRaw)
  const comment = section(text, '评语').trim()
  const items: AcceptanceDecisionItem[] =
    comment === '' ? [] : [{ id: 'legacy', comment, images: [] }]
  return { status, items }
}

function asDecisionStatus(value: unknown): DecisionStatus {
  return value === 'accepted' || value === 'rejected' || value === 'pending'
    ? value
    : 'pending'
}

function normalizeItems(raw: unknown): AcceptanceDecisionItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((entry) => {
    const row = (entry ?? {}) as Record<string, unknown>
    const images = Array.isArray(row.images)
      ? row.images.filter((item): item is string => typeof item === 'string')
      : []
    return {
      id: String(row.id ?? ''),
      comment: String(row.comment ?? ''),
      images,
    }
  })
}

function assertWritableDecision(decision: AcceptanceDecision): void {
  if (decision.status === 'accepted' && decision.items.length > 0) {
    throw new ValidationError('有待修改项时不能接受')
  }
  if (decision.status !== 'rejected') return
  if (decision.items.length === 0) {
    throw new ValidationError('没有待修改项时不能让 AI 修改')
  }
  for (const item of decision.items) {
    if (item.comment.trim() === '') {
      throw new ValidationError('待修改项必须填写评语')
    }
  }
}

function section(text: string, title: string): string {
  // 标题后只吃一个换行。若用 \s* 会把中间空行全吃掉，下一节的 ## 逐项会被当成评语。
  const pattern = new RegExp(`## ${title}\\n([\\s\\S]*?)(?=\\n## |$)`)
  return pattern.exec(text)?.[1] ?? ''
}

function normalizeCase(
  item: unknown,
  roundIndex: number,
): {
  id: string
  name: string
  status: string
  observation: string
  evidence: Array<{ path: string; type: string; text?: string }>
} {
  const row = (item ?? {}) as Record<string, unknown>
  const rawEvidence = Array.isArray(row.evidence) ? row.evidence : []
  const evidence = rawEvidence.map((entry) => {
    if (typeof entry === 'string') {
      const path = relativize(entry, roundIndex)
      return { path, type: guessType(path), text: entry }
    }
    const obj = (entry ?? {}) as Record<string, unknown>
    const path = relativize(String(obj.path ?? ''), roundIndex)
    const item: { path: string; type: string; text?: string } = {
      path,
      type: String(obj.type ?? guessType(path)),
    }
    if (obj.text != null) item.text = String(obj.text)
    return item
  })
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? row.title ?? ''),
    status: String(row.status ?? ''),
    observation: String(row.observation ?? ''),
    evidence,
  }
}

function relativize(path: string, roundIndex: number): string {
  if (!path || path.startsWith('rounds/')) return path
  if (path.startsWith('assets/')) return `rounds/${roundIndex}/${path}`
  return `rounds/${roundIndex}/assets/${path}`
}

function guessType(path: string): string {
  return /\.(?:png|jpe?g|gif|webp|svg)$/i.test(path) ? 'image' : 'text'
}

function publicUrl(port: number, token: string): string {
  return `http://127.0.0.1:${port}/?t=${token}`
}

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function checkToken(
  url: URL,
  req: import('node:http').IncomingMessage,
  token: string,
): boolean {
  const fromQuery = url.searchParams.get('t')
  const fromHeader = req.headers['x-acceptance-token']
  return fromQuery === token || fromHeader === token
}

function json(
  res: import('node:http').ServerResponse,
  status: number,
  body: unknown,
): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(`${JSON.stringify(body)}\n`)
}

async function readBody(
  req: import('node:http').IncomingMessage,
): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks).toString('utf-8')
}

async function listenLoopback(
  preferred: number,
): Promise<{ server: ReturnType<typeof createServer>; port: number }> {
  const start = Number.isInteger(preferred)
    ? preferred
    : ACCEPTANCE_DEFAULT_PORT
  const first = Math.min(
    Math.max(start, ACCEPTANCE_DEFAULT_PORT),
    ACCEPTANCE_MAX_PORT,
  )
  for (let port = first; port <= ACCEPTANCE_MAX_PORT; port += 1) {
    try {
      const server = await listen(port)
      return { server, port }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'EADDRINUSE') throw error
    }
  }
  throw new ValidationError(
    `端口 ${ACCEPTANCE_DEFAULT_PORT}–${ACCEPTANCE_MAX_PORT} 都被占用`,
  )
}

function listen(port: number): Promise<ReturnType<typeof createServer>> {
  return new Promise((resolvePromise, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject)
      resolvePromise(server)
    })
  })
}
