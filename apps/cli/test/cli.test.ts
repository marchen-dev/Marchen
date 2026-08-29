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

  it('does not register the retired search command', async () => {
    const program = buildCliProgram()
      .exitOverride()
      .configureOutput({ writeErr: () => {} })

    expect(program.commands.map((command) => command.name())).not.toContain(
      'search',
    )
    await expect(
      program.parseAsync(['node', 'marchen', 'search', '历史决策']),
    ).rejects.toMatchObject({ code: 'commander.unknownCommand' })
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

  it('registers idea lifecycle subcommands', () => {
    const program = buildCliProgram()
    const idea = program.commands.find((cmd) => cmd.name() === 'idea')
    expect(idea).toBeDefined()
    expect(idea?.commands.map((cmd) => cmd.name())).toEqual([
      'list',
      'show',
      'create',
      'update',
      'promote',
      'remove',
    ])
  })
})
