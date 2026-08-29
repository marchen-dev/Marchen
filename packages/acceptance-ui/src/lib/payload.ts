export type DecisionStatus = 'pending' | 'accepted' | 'rejected'

export interface DecisionItem {
  id: string
  comment: string
  images: string[]
}

export interface NewImage {
  mime: string
  data: string
}

export interface Evidence {
  path: string
  type: string
  text?: string
}

export interface CaseItem {
  id: string
  name: string
  status: string
  observation: string
  evidence: Evidence[]
}

export interface Round {
  index: number
  title: string
  conclusion: string
  verdict: string
  cases: CaseItem[]
  humanDecision: Decision | null
}

export interface Decision {
  status: DecisionStatus
  items: DecisionItem[]
}

export interface AcceptancePayload {
  requirement: string
  decision: Decision
  rounds: Round[]
}

export const EMPTY_PAYLOAD: AcceptancePayload = {
  requirement: '',
  decision: { status: 'pending', items: [] },
  rounds: [],
}

const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
])

/**
 * 读取烤进页里的验收快照。模版为空或非法时返回空载荷。
 */
export function readEmbeddedPayload(): AcceptancePayload {
  const el = document.getElementById('acceptance-data')
  const text = el?.textContent?.trim() ?? ''
  if (!text) return EMPTY_PAYLOAD
  try {
    return normalizePayload(JSON.parse(text) as unknown)
  } catch {
    return EMPTY_PAYLOAD
  }
}

/**
 * 探测签字服务。file:// 或 health 失败都视为只读。
 */
export async function probeLive(): Promise<boolean> {
  if (!supportsLiveDecision(location.protocol)) return false
  try {
    const res = await fetch('/health', { cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}

/** 只有 HTTP(S) 页面允许探测并写入本机签核服务。 */
export function supportsLiveDecision(protocol: string): boolean {
  return protocol === 'http:' || protocol === 'https:'
}

export function decisionToken(): string {
  return new URLSearchParams(location.search).get('t') ?? ''
}

/**
 * 从服务读当前决定。
 */
export async function fetchDecision(token: string): Promise<Decision> {
  const res = await fetch(`/decision?t=${encodeURIComponent(token)}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('读取决定失败')
  return normalizeDecision(await res.json())
}

export interface PostedItem extends DecisionItem {
  newImages?: NewImage[]
}

/**
 * 写入决定。成功返回服务端落盘后的文档。
 */
export async function postDecision(
  token: string,
  status: DecisionStatus,
  items: PostedItem[],
): Promise<Decision> {
  const res = await fetch(`/decision?t=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      status,
      items: items.map((item) => {
        const row: PostedItem = {
          id: item.id,
          comment: item.comment,
          images: item.images,
        }
        if (item.newImages && item.newImages.length > 0) {
          row.newImages = item.newImages
        }
        return row
      }),
    }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? '写入失败')
  }
  return normalizeDecision(await res.json())
}

/**
 * 把本地图片转成 POST 用的 mime + base64。
 */
export async function fileToNewImage(file: File): Promise<NewImage> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('附图只支持 png / jpeg / webp / gif')
  }
  const dataUrl = await readAsDataUrl(file)
  const comma = dataUrl.indexOf(',')
  return {
    mime: file.type,
    data: comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl,
  }
}

export function isAllowedImageFile(file: File): boolean {
  return ALLOWED_MIME.has(file.type)
}

export function caseStatusLabel(status: string): string {
  if (status === 'pass' || status === '通过') return '通过'
  if (status === 'fail' || status === '未通过') return '未通过'
  if (status === 'blocked' || status === '受阻') return '受阻'
  return status || '未标'
}

export function firstImage(item: CaseItem): string | null {
  const hit = item.evidence.find(
    (entry) => entry.type === 'image' && entry.path,
  )
  return hit?.path ?? null
}

export function imageEvidence(item: CaseItem): Evidence[] {
  return item.evidence.filter((entry) => entry.type === 'image' && entry.path)
}

export function isReviewWritable(
  live: boolean,
  status: DecisionStatus,
  viewingLatest: boolean,
): boolean {
  return live && status === 'pending' && viewingLatest
}

/** 只有在线查看最新轮的已接受决定才允许撤回。 */
export function isAcceptanceWithdrawable(
  live: boolean,
  status: DecisionStatus,
  viewingLatest: boolean,
): boolean {
  return live && status === 'accepted' && viewingLatest
}

export function caseHistory(
  rounds: readonly Round[],
  caseId: string,
  selectedRoundIndex: number,
): Round[] {
  return [...rounds]
    .filter((round) => round.index !== selectedRoundIndex)
    .reverse()
    .filter(
      (round) =>
        round.cases.some((item) => item.id === caseId) ||
        round.humanDecision?.items.some((item) => item.id === caseId),
    )
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

export function normalizePayload(raw: unknown): AcceptancePayload {
  const row = (raw ?? {}) as Record<string, unknown>
  return {
    requirement: String(row.requirement ?? ''),
    decision: normalizeDecision(row.decision),
    rounds: Array.isArray(row.rounds)
      ? row.rounds.map((entry) => normalizeRound(entry))
      : [],
  }
}

function normalizeDecision(raw: unknown): Decision {
  const row = (raw ?? {}) as Record<string, unknown>
  const status =
    row.status === 'accepted' || row.status === 'rejected'
      ? row.status
      : 'pending'
  const items = Array.isArray(row.items)
    ? row.items.map((entry) => {
        const item = (entry ?? {}) as Record<string, unknown>
        return {
          id: String(item.id ?? ''),
          comment: String(item.comment ?? ''),
          images: Array.isArray(item.images)
            ? item.images.filter(
                (path): path is string => typeof path === 'string',
              )
            : [],
        }
      })
    : []
  return { status, items }
}

function normalizeRound(raw: unknown): Round {
  const row = (raw ?? {}) as Record<string, unknown>
  return {
    index: Number(row.index ?? 0),
    title: String(row.title ?? ''),
    conclusion: String(row.conclusion ?? ''),
    verdict: String(row.verdict ?? ''),
    humanDecision:
      row.humanDecision == null ? null : normalizeDecision(row.humanDecision),
    cases: Array.isArray(row.cases)
      ? row.cases.map((entry) => {
          const item = (entry ?? {}) as Record<string, unknown>
          const evidence = Array.isArray(item.evidence)
            ? item.evidence.map((ev) => {
                const e = (ev ?? {}) as Record<string, unknown>
                const out: Evidence = {
                  path: String(e.path ?? ''),
                  type: String(e.type ?? ''),
                }
                if (e.text != null) out.text = String(e.text)
                return out
              })
            : []
          return {
            id: String(item.id ?? ''),
            name: String(item.name ?? ''),
            status: String(item.status ?? ''),
            observation: String(item.observation ?? ''),
            evidence,
          }
        })
      : [],
  }
}
