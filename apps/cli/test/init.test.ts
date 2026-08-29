import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildCliProgram } from '../src/program.js'

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  initialize: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockResolvedValue(false),
  multiselect: vi.fn().mockResolvedValue(['claude-code']),
}))

vi.mock('@clack/prompts', () => ({
  cancel: vi.fn(),
  confirm: mocks.confirm,
  intro: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
  log: { success: vi.fn() },
  multiselect: mocks.multiselect,
  outro: vi.fn(),
}))

vi.mock('../src/utils/context.js', () => ({
  createContext: () => ({
    workspace: {
      initialize: mocks.initialize,
      isInitialized: mocks.isInitialized,
    },
  }),
}))

describe('init command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isInitialized.mockResolvedValue(false)
    mocks.multiselect.mockResolvedValue(['claude-code'])
  })

  it('initializes without asking about search', async () => {
    const program = buildCliProgram().exitOverride()

    await program.parseAsync(['node', 'marchen', 'init'])

    expect(mocks.confirm).not.toHaveBeenCalled()
    expect(mocks.initialize).toHaveBeenCalledWith({
      providers: ['claude-code'],
      version: program.version(),
    })
  })
})
