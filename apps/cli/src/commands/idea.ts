import type { Command } from 'commander'
import * as p from '@clack/prompts'
import { ValidationError } from '@marchen/shared'
import pc from 'picocolors'
import { createContext } from '../utils/context.js'
import { handleError } from '../utils/error.js'
import { readStdin } from '../utils/stdin.js'

interface JsonOption {
  readonly json?: boolean
}

/** 输出 JSON 结果 */
function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2))
}

/**
 * 注册 idea 生命周期命令组
 *
 * @param program - Commander 程序实例
 */
export function registerIdeaCommand(program: Command): void {
  const idea = program.command('idea').description('管理尚未晋升的探索想法')

  idea
    .command('list')
    .description('列出尚未晋升的 Idea')
    .option('--json', '输出 JSON 格式')
    .action(async (options: JsonOption) => {
      try {
        const { ideas } = createContext()
        const result = await ideas.list()
        if (options.json) {
          printJson(result)
          return
        }

        p.intro('Marchen Ideas')
        if (result.ideas.length === 0) {
          p.log.info('暂无尚未晋升的 Idea')
        } else {
          const rows = result.ideas.map(
            (entry) =>
              `${pc.bold(entry.name)}  ${entry.title}\n  ${pc.dim(entry.summary)}`,
          )
          p.log.info(rows.join('\n\n'))
        }
        for (const issue of result.issues) {
          p.log.warn(`${issue.name}: ${issue.message}`)
        }
        p.outro(`共 ${result.ideas.length} 个 Idea`)
      } catch (error) {
        handleError(error)
      }
    })

  idea
    .command('show')
    .description('读取完整 Idea')
    .argument('<name>', 'Idea 名称')
    .option('--json', '输出 JSON 格式')
    .action(async (name: string, options: JsonOption) => {
      try {
        const { ideas } = createContext()
        const result = await ideas.show(name)
        if (options.json) {
          printJson(result)
          return
        }

        p.intro(`Idea · ${result.name}`)
        p.log.info(
          `${pc.bold(result.metadata.title)}\n${result.metadata.summary}\n${pc.dim(result.metadata.tags.join(', ') || '无标签')}`,
        )
        p.note(result.body, '探索状态')
        p.outro(`revision: ${result.revision}`)
      } catch (error) {
        handleError(error)
      }
    })

  idea
    .command('create')
    .description('从标准输入创建 Idea')
    .argument('<name>', 'Idea 名称')
    .requiredOption('--stdin', '从标准输入读取 Markdown')
    .option('--json', '输出 JSON 格式')
    .action(async (name: string, options: JsonOption) => {
      try {
        const markdown = await readStdin()
        const { ideas } = createContext()
        const result = await ideas.create(name, { markdown })
        if (options.json) {
          printJson(result)
          return
        }
        p.log.success(`Idea "${name}" 已创建`)
        p.outro(result.path)
      } catch (error) {
        handleError(error)
      }
    })

  idea
    .command('update')
    .description('使用 revision 保护更新 Idea')
    .argument('<name>', 'Idea 名称')
    .requiredOption('--if-revision <revision>', '预期 SHA-256 revision')
    .requiredOption('--stdin', '从标准输入读取 Markdown')
    .option('--json', '输出 JSON 格式')
    .action(
      async (name: string, options: JsonOption & { ifRevision: string }) => {
        try {
          const markdown = await readStdin()
          const { ideas } = createContext()
          const result = await ideas.update(name, {
            markdown,
            expectedRevision: options.ifRevision,
          })
          if (options.json) {
            printJson(result)
            return
          }
          p.log.success(`Idea "${name}" 已更新`)
          p.outro(`revision: ${result.revision}`)
        } catch (error) {
          handleError(error)
        }
      },
    )

  idea
    .command('promote')
    .description('把一个或多个 Idea 晋升到正式变更')
    .argument('<names...>', '一个或多个 Idea 名称')
    .requiredOption('--change <name>', '目标 open 变更')
    .option('--json', '输出 JSON 格式')
    .action(
      async (names: string[], options: JsonOption & { change: string }) => {
        try {
          const { ideas } = createContext()
          const result = await ideas.promote(names, options.change)
          if (options.json) {
            printJson(result)
            return
          }
          p.log.success(
            `已将 ${result.ideas.map((entry) => entry.name).join(', ')} 晋升到 "${result.change}"`,
          )
          p.outro(`探索背景位于 marchen/changes/${result.change}/exploration/`)
        } catch (error) {
          handleError(error)
        }
      },
    )

  idea
    .command('remove')
    .description('删除尚未晋升的 Idea')
    .argument('<name>', 'Idea 名称')
    .option('--yes', '确认非交互删除')
    .option('--json', '输出 JSON 格式')
    .action(async (name: string, options: JsonOption & { yes?: boolean }) => {
      try {
        if (!options.yes) {
          if (!process.stdin.isTTY) {
            throw new ValidationError('非交互删除必须显式传入 --yes')
          }
          const confirmed = await p.confirm({
            message: `确定删除 Idea "${name}"？`,
            initialValue: false,
          })
          if (p.isCancel(confirmed) || !confirmed) {
            p.log.info('已取消删除')
            return
          }
        }

        const { ideas } = createContext()
        const result = await ideas.remove(name)
        if (options.json) {
          printJson(result)
          return
        }
        p.log.success(`Idea "${name}" 已删除`)
      } catch (error) {
        handleError(error)
      }
    })
}
