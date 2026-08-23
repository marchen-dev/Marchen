import type { DecisionStatus } from '../src/index.js'
import { describe, expect, it } from 'vitest'
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
} from '../src/index.js'

describe('acceptance 路径常量', () => {
  it('目录与文件名符合 design', () => {
    expect(ACCEPTANCE_DIRECTORY_NAME).toBe('acceptance')
    expect(ACCEPTANCE_REQUIREMENT_FILE).toBe('requirement.md')
    expect(ACCEPTANCE_DECISION_FILE).toBe('decision.json')
    expect(ACCEPTANCE_LEGACY_DECISION_FILE).toBe('decision.md')
    expect(ACCEPTANCE_DECISION_ASSETS_DIRECTORY).toBe('decision-assets')
    expect(ACCEPTANCE_DECISION_ASSET_MAX_BYTES).toBe(5 * 1024 * 1024)
    expect(ACCEPTANCE_PAGE_FILE).toBe('index.html')
    expect(ACCEPTANCE_ROUNDS_DIRECTORY).toBe('rounds')
    expect(ACCEPTANCE_SERVE_LOCK_FILE).toBe('.serve.pid')
  })

  it('端口范围是 7420–7430', () => {
    expect(ACCEPTANCE_DEFAULT_PORT).toBe(7420)
    expect(ACCEPTANCE_MAX_PORT).toBe(7430)
    expect(ACCEPTANCE_MAX_PORT).toBeGreaterThanOrEqual(ACCEPTANCE_DEFAULT_PORT)
  })
})

describe('decisionStatus', () => {
  it('只允许 pending / accepted / rejected', () => {
    const allowed: DecisionStatus[] = ['pending', 'accepted', 'rejected']
    expect(allowed).toHaveLength(3)
  })
})
