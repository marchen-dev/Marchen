import { describe, expect, it } from 'vitest'
import {
  AGENT_PROVIDERS,
  COMMAND_TEMPLATES,
  DEFAULT_PROVIDER_IDS,
  SKILL_TEMPLATES,
} from '../src/index.js'

describe('providers', () => {
  it('注册表包含 10 个 provider', () => {
    expect(Object.keys(AGENT_PROVIDERS)).toHaveLength(10)
  })

  it('注册表包含 claude-code', () => {
    const provider = AGENT_PROVIDERS['claude-code']
    expect(provider).toBeDefined()
    expect(provider!.id).toBe('claude-code')
    expect(provider!.name).toBe('Claude Code')
    expect(provider!.skillDir).toBe('.claude/skills')
    expect(provider!.commandDir).toBe('.claude/commands/marchen')
  })

  it('注册表包含 codex', () => {
    const provider = AGENT_PROVIDERS.codex
    expect(provider).toBeDefined()
    expect(provider!.id).toBe('codex')
    expect(provider!.name).toBe('Codex')
    expect(provider!.skillDir).toBe('.agents/skills')
    expect(provider!.commandDir).toBeUndefined()
  })

  it('注册表包含所有预期的 provider id', () => {
    const ids = Object.keys(AGENT_PROVIDERS).sort()
    expect(ids).toEqual([
      'antigravity',
      'claude-code',
      'codex',
      'copilot',
      'cursor',
      'gemini-cli',
      'kilocode',
      'kiro',
      'opencode',
      'windsurf',
    ])
  })

  it('默认 provider 为 claude-code', () => {
    expect(DEFAULT_PROVIDER_IDS).toEqual(['claude-code'])
  })

  it('所有 provider 的 key 与 id 一致', () => {
    for (const [key, provider] of Object.entries(AGENT_PROVIDERS)) {
      expect(key).toBe(provider.id)
    }
  })

  it('只有 claude-code 有 commandDir', () => {
    for (const [id, provider] of Object.entries(AGENT_PROVIDERS)) {
      if (id === 'claude-code') {
        expect(provider.commandDir).toBeDefined()
      } else {
        expect(provider.commandDir).toBeUndefined()
      }
    }
  })
})

describe('acceptance 模板', () => {
  it('skill 使用 decision.json 且禁止代点、禁止 agent-browser', () => {
    const content = SKILL_TEMPLATES.acceptance?.content ?? ''
    expect(content).toContain('decision.json')
    expect(content).not.toContain('decision.md')
    expect(content).toContain('让 AI 修改')
    expect(content).toContain('human-decision.json')
    expect(content).toContain('agent-browser')
  })

  it.each([
    ['skill', SKILL_TEMPLATES.acceptance?.content ?? ''],
    ['command', COMMAND_TEMPLATES.acceptance?.content ?? ''],
  ])('%s 约束跨轮案例 id 在改文案、新增和移除时的行为', (_, content) => {
    expect(content).toContain('文案调整或排序变化不得生成新 id')
    expect(content).toContain('新增验收目标才生成新 id')
    expect(content).toContain('已移除目标的 id 只留在历史轮次')
    expect(content).toContain('不得拿给别的新目标复用')
  })
})

describe('idea 工作流模板', () => {
  it('同时生成 capture skill 和 command', () => {
    expect(SKILL_TEMPLATES.capture?.dirName).toBe('marchen-capture')
    expect(SKILL_TEMPLATES.capture?.content).toContain(
      'marchen idea create <name> --stdin --json',
    )
    expect(COMMAND_TEMPLATES.capture?.fileName).toBe('capture.md')
    expect(COMMAND_TEMPLATES.capture?.content).toContain(
      'marchen idea update <name> --if-revision',
    )
  })

  it.each([
    ['skill', SKILL_TEMPLATES.explore?.content ?? ''],
    ['command', COMMAND_TEMPLATES.explore?.content ?? ''],
  ])('%s explore 使用 Idea 与确定性历史路径', (_, content) => {
    expect(content).toContain('marchen idea list --json')
    expect(content).toContain('/marchen:capture')
    expect(content).toContain('marchen/changelog.md')
    expect(content).toContain('archive')
    expect(content).not.toContain('marchen search')
    expect(content).not.toContain('QMD')
    expect(content).not.toContain('Hybrid Search')
    expect(content).not.toContain('embedding')
  })

  it.each([
    ['skill', SKILL_TEMPLATES.apply?.content ?? ''],
    ['command', COMMAND_TEMPLATES.apply?.content ?? ''],
  ])('%s apply 通过 changelog 与 archive 核对历史', (_, content) => {
    expect(content).toContain('marchen/changelog.md')
    expect(content).toContain('archive')
    expect(content).not.toContain('marchen search')
    expect(content).not.toContain('QMD')
  })

  it.each([
    ['propose skill', SKILL_TEMPLATES.propose?.content ?? ''],
    ['propose command', COMMAND_TEMPLATES.propose?.content ?? ''],
    ['lite skill', SKILL_TEMPLATES.lite?.content ?? ''],
    ['lite command', COMMAND_TEMPLATES.lite?.content ?? ''],
  ])('%s 显式读取并晋升 Idea', (_, content) => {
    expect(content).toContain('idea:<name>')
    expect(content).toContain('marchen idea show <name> --json')
    expect(content).toContain('marchen idea promote')
    expect(content).toContain('不得隐式消费')
  })
})
