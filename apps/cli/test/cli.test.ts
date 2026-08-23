import { describe, expect, it } from 'vitest'
import { buildCliProgram } from '../src/program.js'

describe('buildCliProgram', () => {
  it('registers the init command', () => {
    const program = buildCliProgram()
    const initCommand = program.commands.find((cmd) => cmd.name() === 'init')

    expect(initCommand).toBeDefined()
    expect(initCommand?.description()).toBe('初始化 Marchen 目录结构')
  })

  it('registers the new command', () => {
    const program = buildCliProgram()
    const newCommand = program.commands.find((cmd) => cmd.name() === 'new')

    expect(newCommand).toBeDefined()
    expect(newCommand?.description()).toBe('创建一个新的变更')
  })

  it('registers acceptance subcommands', () => {
    const program = buildCliProgram()
    const acc = program.commands.find((cmd) => cmd.name() === 'acceptance')
    expect(acc).toBeDefined()
    const names = acc?.commands.map((cmd) => cmd.name()) ?? []
    expect(names).toEqual(
      expect.arrayContaining(['serve', 'stop', 'render', 'status']),
    )
  })
})
