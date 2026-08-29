import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { exists, readFile, writeFile } from '@marchen/fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ChangeManager, IdeaManager, Workspace } from '../src/index.js'

/** 构造由 Skill 提供、时间字段留给 CLI 管理的候选 Markdown */
function candidate(
  title: string,
  summary: string,
  body = '## 背景\n\n这是足够完整的探索背景内容。',
): string {
  return `---\ntitle: ${title}\nsummary: ${summary}\ntags:\n  - cli\n  - skill\n---\n\n${body}\n`
}

describe('ideaManager', () => {
  let root: string
  let workspace: Workspace
  let changes: ChangeManager
  let ideas: IdeaManager

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'marchen-idea-'))
    workspace = new Workspace(root)
    await workspace.initialize({ providers: [] })
    changes = new ChangeManager(workspace)
    ideas = new IdeaManager(workspace, changes)
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('创建、读取和列举 Idea', async () => {
    const result = await ideas.create('capture-workflow', {
      markdown: candidate('捕获工作流', '保存尚未准备实施的探索状态'),
    })
    expect(result.path).toBe('marchen/ideas/capture-workflow.md')
    expect(result.revision).toMatch(/^sha256:[a-f0-9]{64}$/)

    const document = await ideas.show('capture-workflow')
    expect(document.name).toBe('capture-workflow')
    expect(document.metadata).toMatchObject({
      format: 1,
      title: '捕获工作流',
      summary: '保存尚未准备实施的探索状态',
      tags: ['cli', 'skill'],
    })
    expect(document.body).toContain('探索背景')
    expect(document.markdown).toContain('createdAt:')

    expect(await ideas.list()).toEqual({
      ideas: [{ name: 'capture-workflow', ...document.metadata }],
      issues: [],
    })
  })

  it('拒绝非法名称、空正文和同名覆盖', async () => {
    await expect(
      ideas.create('../escape', { markdown: candidate('标题', '摘要') }),
    ).rejects.toThrow('不合法')
    await expect(
      ideas.create('empty-body', {
        markdown: '---\ntitle: 标题\nsummary: 摘要\n---\n',
      }),
    ).rejects.toThrow('正文不能为空')

    await ideas.create('same-name', {
      markdown: candidate('第一版', '第一版摘要'),
    })
    await expect(
      ideas.create('same-name', {
        markdown: candidate('第二版', '第二版摘要'),
      }),
    ).rejects.toThrow('已存在')
    expect((await ideas.show('same-name')).metadata.title).toBe('第一版')
  })

  it('更新时保留创建时间并拒绝陈旧 revision', async () => {
    await ideas.create('updatable', {
      markdown: candidate('初始标题', '初始摘要'),
    })
    const before = await ideas.show('updatable')
    const result = await ideas.update('updatable', {
      expectedRevision: before.revision,
      markdown: candidate(
        '更新标题',
        '更新摘要',
        '## 新背景\n\n已经调和的新内容。',
      ),
    })
    const after = await ideas.show('updatable')

    expect(after.metadata.createdAt).toBe(before.metadata.createdAt)
    expect(after.metadata.title).toBe('更新标题')
    expect(result.revision).toBe(after.revision)
    expect(result.revision).not.toBe(before.revision)

    await expect(
      ideas.update('updatable', {
        expectedRevision: before.revision,
        markdown: candidate('过期更新', '不应写入'),
      }),
    ).rejects.toThrow('revision 不匹配')
    expect((await ideas.show('updatable')).metadata.title).toBe('更新标题')
  })

  it('列举时隔离损坏文档和未知格式并按更新时间倒序', async () => {
    await ideas.create('older', {
      markdown: candidate('较早', '较早的摘要'),
    })
    const older = await ideas.show('older')
    await ideas.create('newer', {
      markdown: candidate('较新', '较新的摘要'),
    })
    const newerPath = join(workspace.ideaDir, 'newer.md')
    const newer = (await readFile(newerPath)).replace(
      /updatedAt: .+/,
      "updatedAt: '2099-01-01T00:00:00.000Z'",
    )
    await writeFile(newerPath, newer)
    await writeFile(join(workspace.ideaDir, 'broken.md'), 'not-frontmatter')
    await writeFile(
      join(workspace.ideaDir, 'future.md'),
      older.markdown.replace('format: 1', 'format: 99'),
    )

    const result = await ideas.list()
    expect(result.ideas.map((idea) => idea.name)).toEqual(['newer', 'older'])
    expect(result.issues.map((issue) => issue.name).sort()).toEqual([
      'broken',
      'future',
    ])
  })

  it('删除指定 Idea', async () => {
    await ideas.create('discarded', {
      markdown: candidate('废弃想法', '不再继续'),
    })
    const result = await ideas.remove('discarded')
    expect(result).toEqual({
      name: 'discarded',
      path: 'marchen/ideas/discarded.md',
    })
    expect(await exists(join(workspace.ideaDir, 'discarded.md'))).toBe(false)
    await expect(ideas.remove('discarded')).rejects.toThrow('不存在')
  })

  it('规划就绪后把一个或多个 Idea 晋升到 lite change', async () => {
    await changes.create('ready-change', 'lite')
    await writeFile(
      join(workspace.changeDir, 'ready-change', 'tasks.md'),
      '## 实现\n\n- [ ] 完成一个足够具体且可执行的实现任务。\n',
    )
    await ideas.create('first-idea', {
      markdown: candidate('第一个想法', '第一个摘要'),
    })
    await ideas.create('second-idea', {
      markdown: candidate('第二个想法', '第二个摘要'),
    })

    const result = await ideas.promote(
      ['first-idea', 'second-idea'],
      'ready-change',
    )
    expect(result.ideas).toHaveLength(2)
    expect(await exists(join(workspace.ideaDir, 'first-idea.md'))).toBe(false)
    expect(
      await exists(
        join(
          workspace.changeDir,
          'ready-change',
          'exploration',
          'first-idea.md',
        ),
      ),
    ).toBe(true)
  })

  it('拒绝向规划未就绪的 change 晋升', async () => {
    await changes.create('blocked-change', 'lite')
    await ideas.create('parked', {
      markdown: candidate('停放想法', '继续保留'),
    })

    await expect(ideas.promote(['parked'], 'blocked-change')).rejects.toThrow(
      '规划产物尚未就绪',
    )
    expect(await exists(join(workspace.ideaDir, 'parked.md'))).toBe(true)
  })

  it('批量晋升预检发现目标冲突时不移动任何源文件', async () => {
    await changes.create('conflict-change', 'lite')
    const changeDir = join(workspace.changeDir, 'conflict-change')
    await writeFile(
      join(changeDir, 'tasks.md'),
      '## 实现\n\n- [ ] 完成一个足够具体且可执行的实现任务。\n',
    )
    await ideas.create('safe-source', {
      markdown: candidate('安全源', '应该保持原位'),
    })
    await ideas.create('conflicting-source', {
      markdown: candidate('冲突源', '目标已经存在'),
    })
    await writeFile(
      join(changeDir, 'exploration', 'conflicting-source.md'),
      'existing',
    )

    await expect(
      ideas.promote(['safe-source', 'conflicting-source'], 'conflict-change'),
    ).rejects.toThrow('已存在同名探索记录')
    expect(await exists(join(workspace.ideaDir, 'safe-source.md'))).toBe(true)
    expect(await exists(join(workspace.ideaDir, 'conflicting-source.md'))).toBe(
      true,
    )
  })
})
