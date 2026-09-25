import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildCliProgram } from '../src/program.js'

const getConfigValue = vi.hoisted(() => vi.fn())
vi.mock('../src/utils/context.js', () => ({
  createContext: () => ({ workspace: { getConfigValue } }),
}))

afterEach(() => {
  vi.restoreAllMocks()
  getConfigValue.mockReset()
  process.exitCode = 0
})

describe('config get', () => {
  it('输出布尔 JSON 值', async () => {
    getConfigValue.mockResolvedValue(false)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await buildCliProgram().parseAsync([
      'node',
      'marchen',
      'config',
      'get',
      'acceptance.enabled',
      '--json',
    ])
    expect(getConfigValue).toHaveBeenCalledWith('acceptance.enabled')
    expect(log).toHaveBeenCalledExactlyOnceWith('{"value":false}')
  })

  it('默认输出纯文本值', async () => {
    getConfigValue.mockResolvedValue(true)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await buildCliProgram().parseAsync([
      'node',
      'marchen',
      'config',
      'get',
      'acceptance.enabled',
    ])
    expect(log).toHaveBeenCalledExactlyOnceWith('true')
  })

  it('失败写 stderr，退出码非零且 stdout 不返回值', async () => {
    getConfigValue.mockRejectedValue(new Error('配置类型错误'))
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    await buildCliProgram().parseAsync([
      'node',
      'marchen',
      'config',
      'get',
      'acceptance.enabled',
      '--json',
    ])
    expect(log).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledWith('配置类型错误')
    expect(process.exitCode).toBe(1)
  })
})
