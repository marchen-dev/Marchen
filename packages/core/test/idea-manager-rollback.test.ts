import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as fs from '@marchen/fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangeManager, IdeaManager, Workspace } from '../src/index.js'

vi.mock('@marchen/fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@marchen/fs')>()
  return { ...actual, moveFile: vi.fn() }
})

const markdown = `---
title: 回滚测试
summary: 验证批量晋升失败后的回滚路径
tags: []
---

## 背景

这是用于回滚测试的完整正文。
`

describe('ideaManager promote 回滚', () => {
  let root: string
  let workspace: Workspace
  let changes: ChangeManager
  let ideas: IdeaManager

  beforeEach(async () => {
    vi.clearAllMocks()
    root = await mkdtemp(join(tmpdir(), 'marchen-idea-rollback-'))
    workspace = new Workspace(root)
    await workspace.initialize({ providers: [] })
    changes = new ChangeManager(workspace)
    ideas = new IdeaManager(workspace, changes)
    await changes.create('rollback-change', 'lite')
    await fs.writeFile(
      join(workspace.changeDir, 'rollback-change', 'tasks.md'),
      '## 实现\n\n- [ ] 完成一个足够具体且可执行的实现任务。\n',
    )
    await ideas.create('first', { markdown })
    await ideas.create('second', { markdown })
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('第二次移动失败时反向回滚第一次移动', async () => {
    vi.mocked(fs.moveFile)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('second move failed'))
      .mockResolvedValueOnce(undefined)

    await expect(
      ideas.promote(['first', 'second'], 'rollback-change'),
    ).rejects.toThrow('已回滚先前移动')
    expect(fs.moveFile).toHaveBeenCalledTimes(3)
    expect(vi.mocked(fs.moveFile).mock.calls[2]![0]).toContain(
      'exploration/first.md',
    )
    expect(vi.mocked(fs.moveFile).mock.calls[2]![1]).toContain('ideas/first.md')
  })

  it('回滚也失败时报告具体 Idea', async () => {
    vi.mocked(fs.moveFile)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('second move failed'))
      .mockRejectedValueOnce(new Error('rollback failed'))

    await expect(
      ideas.promote(['first', 'second'], 'rollback-change'),
    ).rejects.toThrow('回滚失败：first')
  })
})
