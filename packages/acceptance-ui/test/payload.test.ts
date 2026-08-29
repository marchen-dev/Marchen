import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  caseHistory,
  isReviewWritable,
  normalizePayload,
  postDecision,
  supportsLiveDecision,
} from '../src/lib/payload'
import {
  acceptanceSummary,
  normalizeImageIndex,
  opinionDraftKey,
  usesInlineInspector,
} from '../src/lib/review-workbench'

describe('验收页 payload', () => {
  it('历史轮缺少 humanDecision 时兼容为 null', () => {
    const payload = normalizePayload({
      rounds: [
        {
          index: 1,
          cases: [{ id: 'login', name: '登录', evidence: [] }],
        },
      ],
    })

    expect(payload.rounds[0]?.humanDecision).toBeNull()
  })

  it('只按稳定 id 串联历史，新增与已移除案例不会串线', () => {
    const payload = normalizePayload({
      rounds: [
        {
          index: 1,
          cases: [{ id: 'login', name: '旧文案', evidence: [] }],
          humanDecision: {
            status: 'rejected',
            items: [{ id: 'login', comment: '提高对比度', images: [] }],
          },
        },
        {
          index: 2,
          cases: [
            { id: 'login', name: '登录按钮新文案', evidence: [] },
            { id: 'signup', name: '新增注册按钮', evidence: [] },
          ],
        },
        {
          index: 3,
          cases: [{ id: 'signup', name: '只剩注册按钮', evidence: [] }],
        },
      ],
    })

    expect(
      caseHistory(payload.rounds, 'login', 2).map((round) => round.index),
    ).toEqual([1])
    expect(
      caseHistory(payload.rounds, 'signup', 3).map((round) => round.index),
    ).toEqual([2])
  })

  it('只有服务在线、pending 且查看最新轮时可写', () => {
    expect(isReviewWritable(true, 'pending', true)).toBe(true)
    expect(isReviewWritable(false, 'pending', true)).toBe(false)
    expect(isReviewWritable(true, 'pending', false)).toBe(false)
    expect(isReviewWritable(true, 'accepted', true)).toBe(false)
    expect(isReviewWritable(true, 'rejected', true)).toBe(false)
  })

  it('file:// 和未知协议不能探测签核写入', () => {
    expect(supportsLiveDecision('file:')).toBe(false)
    expect(supportsLiveDecision('data:')).toBe(false)
    expect(supportsLiveDecision('http:')).toBe(true)
    expect(supportsLiveDecision('https:')).toBe(true)
  })
})

describe('审查工作区纯逻辑', () => {
  it('1280px 起使用常驻检查器', () => {
    expect(usesInlineInspector(1279)).toBe(false)
    expect(usesInlineInspector(1280)).toBe(true)
    expect(usesInlineInspector(1440)).toBe(true)
  })

  it('图片变化时把索引重置到有效范围', () => {
    expect(normalizeImageIndex(3, 2)).toBe(1)
    expect(normalizeImageIndex(-1, 2)).toBe(0)
    expect(normalizeImageIndex(1, 0)).toBe(0)
  })

  it('草稿键由轮次和稳定 case id 组成', () => {
    expect(opinionDraftKey(2, 'login')).toBe('2:login')
    expect(opinionDraftKey(3, 'login')).not.toBe(opinionDraftKey(2, 'login'))
  })

  it('页头摘要不推导逐项已查看或验收进度', () => {
    const summary = acceptanceSummary(3, 1)
    expect(summary).toEqual({ caseCount: 3, pendingCount: 1 })
    expect(summary).not.toHaveProperty('reviewedCount')
    expect(summary).not.toHaveProperty('acceptedCount')
  })
})

describe('决定提交', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('post 成功后直接返回响应决定，不触发页面刷新', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'accepted', items: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(postDecision('token', 'accepted', [])).resolves.toEqual({
      status: 'accepted',
      items: [],
    })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/decision?t=token')
  })

  it('只向写入接口提交决定字段和非空新附件', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'pending', items: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await postDecision('a&b', 'pending', [
      {
        id: 'login',
        comment: '调整间距',
        images: ['old.png'],
        newImages: [{ mime: 'image/png', data: 'base64' }],
      },
    ])

    const [, init] = fetchMock.mock.calls[0] ?? []
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/decision?t=a%26b')
    expect(JSON.parse(String(init?.body))).toEqual({
      status: 'pending',
      items: [
        {
          id: 'login',
          comment: '调整间距',
          images: ['old.png'],
          newImages: [{ mime: 'image/png', data: 'base64' }],
        },
      ],
    })
  })
})
