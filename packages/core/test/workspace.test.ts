import * as fs from '@marchen/fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Workspace } from '../src/index.js'

// Mock fs 层，避免真实文件操作
vi.mock('@marchen/fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@marchen/fs')>()
  return {
    ...actual,
    appendFile: vi.fn().mockResolvedValue(undefined),
    ensureDir: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(''),
    writeFile: vi.fn().mockResolvedValue(undefined),
    writeYaml: vi.fn().mockResolvedValue(undefined),
    readYaml: vi.fn().mockResolvedValue({}),
    removeFile: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(false),
  }
})

describe('workspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('构造时计算路径', () => {
    const workspace = new Workspace('/test/root')
    expect(workspace.root).toBe('/test/root')
    expect(workspace.specDir).toContain('marchen')
    expect(workspace.changeDir).toContain('changes')
    expect(workspace.ideaDir).toContain('ideas')
  })

  it('提供包边界信息', () => {
    const workspace = new Workspace('/test/root')
    expect(workspace.packageBoundaries).toHaveLength(4)
    expect(workspace.packageBoundaries[0]!.name).toBe('@marchen/shared')
  })

  describe('isInitialized', () => {
    it('目录存在时返回 true', async () => {
      vi.mocked(fs.exists).mockResolvedValueOnce(true)
      const workspace = new Workspace('/test/root')
      expect(await workspace.isInitialized()).toBe(true)
    })

    it('目录不存在时返回 false', async () => {
      vi.mocked(fs.exists).mockResolvedValueOnce(false)
      const workspace = new Workspace('/test/root')
      expect(await workspace.isInitialized()).toBe(false)
    })
  })

  describe('initialize', () => {
    it('创建目录结构和配置文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('marchen'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('changes'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('archive'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('ideas'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('ideas/.gitkeep'),
        '',
      )
      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({ schema: 'full' }),
      )
      const configCall = vi
        .mocked(fs.writeYaml)
        .mock.calls.find(([path]) => path.endsWith('config.yaml'))
      expect(configCall?.[1]).not.toHaveProperty('search')
      expect(configCall?.[1]).not.toHaveProperty('models')
      expect(
        vi
          .mocked(fs.ensureDir)
          .mock.calls.some(([path]) => path.includes('.search')),
      ).toBe(false)
    })

    it('创建缺失的 .gitattributes 并排除归档验收页', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/test/root/.gitattributes',
        expect.stringContaining(
          'marchen/archive/**/acceptance/index.html linguist-generated',
        ),
      )
    })

    it('保留已有 .gitattributes 内容并追加规则', async () => {
      vi.mocked(fs.exists)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        '*.md linguist-documentation\n',
      )

      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      expect(fs.writeFile).not.toHaveBeenCalledWith(
        '/test/root/.gitattributes',
        expect.any(String),
      )
      expect(fs.appendFile).toHaveBeenCalledWith(
        '/test/root/.gitattributes',
        expect.stringContaining(
          'marchen/archive/**/acceptance/index.html linguist-generated',
        ),
      )
    })

    it('已有 Linguist 规则时不重复写入', async () => {
      vi.mocked(fs.exists)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        'marchen/archive/**/acceptance/index.html linguist-generated\n',
      )

      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      expect(fs.appendFile).not.toHaveBeenCalled()
      expect(fs.writeFile).not.toHaveBeenCalledWith(
        '/test/root/.gitattributes',
        expect.any(String),
      )
    })

    it('默认只生成 Claude Code 的文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.claude/skills/marchen-propose'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.claude/skills/marchen-propose/SKILL.md'),
        expect.stringContaining('marchen-propose'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.claude/commands/marchen'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.claude/commands/marchen/propose.md'),
        expect.stringContaining('marchen:propose'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.claude/skills/marchen-capture/SKILL.md'),
        expect.stringContaining('marchen-capture'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.claude/commands/marchen/capture.md'),
        expect.stringContaining('Marchen: Capture'),
      )
    })

    it('默认不生成 Codex 的文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      const ensureDirCalls = vi.mocked(fs.ensureDir).mock.calls.map(([p]) => p)
      expect(ensureDirCalls.some((p) => p.includes('.agents'))).toBe(false)
    })

    it('config.yaml 包含 providers 字段', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({ providers: ['claude-code'] }),
      )
    })

    it('指定多个 provider 时为每个生成 skill 文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['claude-code', 'codex'] })

      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.claude/skills/marchen-propose'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.agents/skills/marchen-propose'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.claude/skills/marchen-capture'),
      )
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.agents/skills/marchen-capture'),
      )
    })

    it('codex provider 不生成 command 文件', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['codex'] })

      const ensureDirCalls = vi.mocked(fs.ensureDir).mock.calls.map(([p]) => p)
      expect(ensureDirCalls.some((p) => p.includes('commands'))).toBe(false)
    })

    it('所有 skill 内容跨 provider 一致', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['claude-code', 'codex'] })

      const writeFileCalls = vi.mocked(fs.writeFile).mock.calls
      const claudeSkills = writeFileCalls.filter(
        ([path]) =>
          typeof path === 'string' &&
          path.includes('.claude/skills/') &&
          path.endsWith('/SKILL.md'),
      )
      expect(claudeSkills.length).toBeGreaterThan(0)

      for (const [claudePath, content] of claudeSkills) {
        const suffix = claudePath.split('.claude/skills/')[1]
        const codexSkill = writeFileCalls.find(
          ([path]) =>
            typeof path === 'string' &&
            path.endsWith(`.agents/skills/${suffix}`),
        )
        expect(codexSkill?.[1]).toBe(content)
      }
    })

    it('config.yaml 持久化多个 provider', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['claude-code', 'codex'] })

      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({ providers: ['claude-code', 'codex'] }),
      )
    })

    it('忽略无效的 provider id', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ providers: ['invalid-provider'] })

      const ensureDirCalls = vi.mocked(fs.ensureDir).mock.calls.map(([p]) => p)
      expect(ensureDirCalls.some((p) => p.includes('skills'))).toBe(false)
    })

    it('传入 version 时写入 config.yaml', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize({ version: '1.0.0' })

      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({ version: '1.0.0' }),
      )
    })

    it('不传 version 时 config.yaml 不含 version 字段', async () => {
      const workspace = new Workspace('/test/root')
      await workspace.initialize()

      const writeYamlCalls = vi.mocked(fs.writeYaml).mock.calls
      const configCall = writeYamlCalls.find(([p]) =>
        (p as string).includes('config.yaml'),
      )
      expect(configCall).toBeDefined()
      expect(configCall![1]).not.toHaveProperty('version')
    })
  })

  describe('update', () => {
    it('正常更新：覆盖 skill/command 文件并更新 version', async () => {
      vi.mocked(fs.readYaml).mockResolvedValueOnce({
        schema: 'full',
        context: '',
        providers: ['claude-code'],
        perArtifactRules: {},
        version: '0.5.0',
      })

      const workspace = new Workspace('/test/root')
      const result = await workspace.update({ version: '1.0.0' })

      expect(result.previousVersion).toBe('0.5.0')
      expect(result.currentVersion).toBe('1.0.0')
      expect(result.providersUpdated).toContain('Claude Code')
      expect(result.skillCount).toBeGreaterThan(0)

      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({ version: '1.0.0' }),
      )
    })

    it('版本一致时跳过更新', async () => {
      vi.mocked(fs.readYaml).mockResolvedValueOnce({
        schema: 'full',
        providers: ['claude-code'],
        version: '1.0.0',
      })

      const workspace = new Workspace('/test/root')
      const result = await workspace.update({ version: '1.0.0' })

      expect(result.providersUpdated).toEqual([])
      expect(result.skillCount).toBe(0)
      expect(result.commandCount).toBe(0)
      expect(fs.writeYaml).not.toHaveBeenCalled()
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('ideas'),
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('ideas/.gitkeep'),
        '',
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/test/root/.gitattributes',
        expect.stringContaining(
          'marchen/archive/**/acceptance/index.html linguist-generated',
        ),
      )
    })

    it('版本一致时仍清理旧搜索配置', async () => {
      vi.mocked(fs.readYaml).mockResolvedValueOnce({
        schema: 'full',
        providers: ['claude-code'],
        version: '1.0.0',
        search: { enabled: true },
        models: { endpoint: 'https://example.com' },
        custom: '保留',
      })

      const workspace = new Workspace('/test/root')
      const result = await workspace.update({ version: '1.0.0' })

      expect(result.providersUpdated).toEqual([])
      expect(fs.writeYaml).toHaveBeenCalledTimes(1)
      const migrated = vi.mocked(fs.writeYaml).mock.calls[0]![1]
      expect(migrated).not.toHaveProperty('search')
      expect(migrated).not.toHaveProperty('models')
      expect(migrated).toMatchObject({ custom: '保留', version: '1.0.0' })
    })

    it('重复迁移搜索配置保持幂等', async () => {
      vi.mocked(fs.readYaml)
        .mockResolvedValueOnce({
          schema: 'full',
          providers: ['claude-code'],
          version: '1.0.0',
          search: { enabled: false },
          models: { endpoint: 'https://example.com' },
        })
        .mockResolvedValueOnce({
          schema: 'full',
          providers: ['claude-code'],
          version: '1.0.0',
        })

      const workspace = new Workspace('/test/root')
      await workspace.update({ version: '1.0.0' })
      await workspace.update({ version: '1.0.0' })

      expect(fs.writeYaml).toHaveBeenCalledTimes(1)
    })

    it('跨版本迁移保留其他配置且不删除遗留索引', async () => {
      vi.mocked(fs.readYaml).mockResolvedValueOnce({
        schema: 'full',
        context: 'custom context',
        providers: ['claude-code'],
        version: '0.8.3',
        search: { enabled: true },
        models: { endpoint: 'https://example.com' },
      })

      const workspace = new Workspace('/test/root')
      await workspace.update({ version: '1.0.0' })

      const migrated = vi.mocked(fs.writeYaml).mock.calls.at(-1)![1]
      expect(migrated).toMatchObject({
        context: 'custom context',
        version: '1.0.0',
      })
      expect(migrated).not.toHaveProperty('search')
      expect(migrated).not.toHaveProperty('models')
      expect(
        vi
          .mocked(fs.removeFile)
          .mock.calls.some(([path]) => path.includes('.search')),
      ).toBe(false)
    })

    it('旧项目无 version 字段时正常更新', async () => {
      vi.mocked(fs.readYaml).mockResolvedValueOnce({
        schema: 'full',
        providers: ['claude-code'],
        perArtifactRules: {},
      })

      const workspace = new Workspace('/test/root')
      const result = await workspace.update({ version: '1.0.0' })

      expect(result.previousVersion).toBeNull()
      expect(result.currentVersion).toBe('1.0.0')
      expect(result.providersUpdated).toContain('Claude Code')
    })

    it('保留 config.yaml 的其他字段', async () => {
      vi.mocked(fs.readYaml).mockResolvedValueOnce({
        schema: 'full',
        context: 'custom context',
        providers: ['claude-code'],
        perArtifactRules: { proposal: 'custom rule' },
        version: '0.5.0',
      })

      const workspace = new Workspace('/test/root')
      await workspace.update({ version: '1.0.0' })

      expect(fs.writeYaml).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        expect.objectContaining({
          context: 'custom context',
          perArtifactRules: { proposal: 'custom rule' },
          version: '1.0.0',
        }),
      )
    })
  })
})
