import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildCliProgram } from '../src/program.js'

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  create: vi.fn(),
  list: vi.fn(),
  promote: vi.fn(),
  readStdin: vi.fn(),
  remove: vi.fn(),
  show: vi.fn(),
  update: vi.fn(),
}))

vi.mock('../src/utils/context.js', () => ({
  createContext: () => ({
    ideas: {
      create: mocks.create,
      list: mocks.list,
      promote: mocks.promote,
      remove: mocks.remove,
      show: mocks.show,
      update: mocks.update,
    },
  }),
}))

vi.mock('../src/utils/stdin.js', () => ({ readStdin: mocks.readStdin }))

vi.mock('@clack/prompts', () => ({
  confirm: mocks.confirm,
  intro: vi.fn(),
  isCancel: () => false,
  log: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
  },
  note: vi.fn(),
  outro: vi.fn(),
}))

/** 执行单条 CLI 命令 */
async function run(...args: string[]): Promise<void> {
  await buildCliProgram().parseAsync(['node', 'marchen', ...args])
}

describe('marchen idea 命令', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.readStdin.mockResolvedValue(
      '---\ntitle: 标题\nsummary: 摘要\n---\n正文',
    )
  })

  it('list --json 保持 stdout 为纯 JSON', async () => {
    const result = { ideas: [], issues: [] }
    mocks.list.mockResolvedValue(result)
    const output = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await run('idea', 'list', '--json')

    expect(output).toHaveBeenCalledOnce()
    expect(JSON.parse(String(output.mock.calls[0]![0]))).toEqual(result)
    output.mockRestore()
  })

  it('show --json 调用完整读取', async () => {
    mocks.show.mockResolvedValue({ name: 'demo', revision: 'sha256:abc' })
    const output = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await run('idea', 'show', 'demo', '--json')

    expect(mocks.show).toHaveBeenCalledWith('demo')
    expect(JSON.parse(String(output.mock.calls[0]![0]))).toMatchObject({
      name: 'demo',
    })
    output.mockRestore()
  })

  it('create 从 stdin 读取 Markdown 并调用 Core', async () => {
    mocks.create.mockResolvedValue({ name: 'demo', revision: 'sha256:new' })
    const output = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await run('idea', 'create', 'demo', '--stdin', '--json')

    expect(mocks.create).toHaveBeenCalledWith('demo', {
      markdown: expect.stringContaining('title'),
    })
    expect(output).toHaveBeenCalledOnce()
    output.mockRestore()
  })

  it('update 传递预期 revision', async () => {
    mocks.update.mockResolvedValue({ name: 'demo', revision: 'sha256:new' })
    const output = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await run(
      'idea',
      'update',
      'demo',
      '--stdin',
      '--if-revision',
      'sha256:old',
      '--json',
    )

    expect(mocks.update).toHaveBeenCalledWith('demo', {
      markdown: expect.stringContaining('title'),
      expectedRevision: 'sha256:old',
    })
    output.mockRestore()
  })

  it('promote 传递多个名称和目标 change', async () => {
    mocks.promote.mockResolvedValue({ change: 'target', ideas: [] })
    const output = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await run(
      'idea',
      'promote',
      'first',
      'second',
      '--change',
      'target',
      '--json',
    )

    expect(mocks.promote).toHaveBeenCalledWith(['first', 'second'], 'target')
    output.mockRestore()
  })

  it('remove --yes 执行非交互删除', async () => {
    mocks.remove.mockResolvedValue({
      name: 'demo',
      path: 'marchen/ideas/demo.md',
    })
    const output = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await run('idea', 'remove', 'demo', '--yes', '--json')

    expect(mocks.confirm).not.toHaveBeenCalled()
    expect(mocks.remove).toHaveBeenCalledWith('demo')
    output.mockRestore()
  })

  it('交互确认取消时不删除', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY')
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: true,
    })
    mocks.confirm.mockResolvedValue(false)

    await run('idea', 'remove', 'demo')

    expect(mocks.confirm).toHaveBeenCalledOnce()
    expect(mocks.remove).not.toHaveBeenCalled()
    if (descriptor) Object.defineProperty(process.stdin, 'isTTY', descriptor)
  })

  it('core 失败时以非零状态退出', async () => {
    mocks.show.mockRejectedValue(new Error('boom'))
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('exit')
    }) as never)

    await expect(run('idea', 'show', 'demo', '--json')).rejects.toThrow('exit')
    expect(exit).toHaveBeenCalledWith(1)
    exit.mockRestore()
  })
})
