import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  caseHistory,
  isReviewWritable,
  normalizePayload,
  postDecision,
} from '../src/lib/payload'

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
})
