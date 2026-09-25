import type { Command } from 'commander'
import { createContext } from '../utils/context.js'

/** 注册只读配置查询命令，解析与校验由 core 负责。 */
export function registerConfigCommand(program: Command): void {
  program
    .command('config')
    .description('查询工作区配置')
    .command('get')
    .description('读取配置生效值')
    .argument('<key>', '配置项（acceptance.enabled）')
    .option('--json', '输出 JSON 格式')
    .action(async (key: string, options: { json?: boolean }) => {
      try {
        const { workspace } = createContext()
        const value = await workspace.getConfigValue(key)
        console.log(options.json ? JSON.stringify({ value }) : String(value))
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error))
        process.exitCode = 1
      }
    })
}
