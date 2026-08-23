import { createRequire } from 'node:module'
import { Command } from 'commander'
import { registerAcceptanceCommand } from './commands/acceptance.js'
import { registerArchiveCommand } from './commands/archive.js'
import { registerInitCommand } from './commands/init.js'
import { registerInstructionsCommand } from './commands/instructions.js'
import { registerListCommand } from './commands/list.js'
import { registerNewCommand } from './commands/new.js'
import { registerSearchCommand } from './commands/search.js'
import { registerStatusCommand } from './commands/status.js'
import { registerUpdateCommand } from './commands/update.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

/**
 * 构建 CLI 程序实例
 *
 * 注册所有命令并返回 Commander 程序实例
 */
export function buildCliProgram(): Command {
  const program = new Command()

  program
    .name('marchen')
    .description('Workflow harness for AI coding agents')
    .version(version, '-v, --version')

  registerAcceptanceCommand(program)
  registerArchiveCommand(program)
  registerInitCommand(program)
  registerInstructionsCommand(program)
  registerListCommand(program)
  registerNewCommand(program)
  registerSearchCommand(program)
  registerStatusCommand(program)
  registerUpdateCommand(program)

  return program
}
