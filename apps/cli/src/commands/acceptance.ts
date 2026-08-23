import type { Command } from 'commander'
import { spawn } from 'node:child_process'
import * as p from '@clack/prompts'
import { AcceptanceManager } from '@marchen/core'
import { createContext } from '../utils/context.js'
import { handleError } from '../utils/error.js'

/**
 * 注册 `marchen acceptance` 子命令组
 */
export function registerAcceptanceCommand(program: Command): void {
  const acc = program
    .command('acceptance')
    .description('验收：灌页、本机签字服务、查看状态')

  acc
    .command('serve')
    .description('在 127.0.0.1 上打开验收页')
    .argument('<name>', '变更名称')
    .option('--port <n>', '起始端口', (value) => Number(value))
    .option('--open', '用系统浏览器打开', true)
    .option('--no-open', '只印 URL，不打开浏览器')
    .option('--json', '输出 JSON')
    .action(
      async (
        name: string,
        options: { port?: number; open?: boolean; json?: boolean },
      ) => {
        try {
          const { workspace } = createContext()
          const manager = new AcceptanceManager(workspace)
          const serveOptions: { port?: number; attachSignals: boolean } = {
            attachSignals: true,
          }
          if (options.port != null) serveOptions.port = options.port
          const result = await manager.serve(name, serveOptions)

          if (options.json) {
            console.log(JSON.stringify(result, null, 2))
          } else {
            p.intro('Marchen CLI')
            p.log.success(result.reused ? '复用已有服务' : '验收服务已启动')
            p.log.info(result.url)
          }

          if (options.open !== false) {
            openBrowser(result.url)
          }

          if (!result.reused) {
            await new Promise(() => {
              // 前台挂起，SIGINT 由 serve 自己清 pid
            })
          }
        } catch (error) {
          handleError(error)
        }
      },
    )

  acc
    .command('stop')
    .description('停止本工作区的验收服务')
    .argument('[name]', '变更名称，省略则停正在跑的那个')
    .option('--json', '输出 JSON')
    .action(async (name: string | undefined, options: { json?: boolean }) => {
      try {
        const { workspace } = createContext()
        const manager = new AcceptanceManager(workspace)
        const stopped = await manager.stop(name)
        if (options.json) {
          console.log(JSON.stringify({ stopped }, null, 2))
          return
        }
        p.intro('Marchen CLI')
        p.log.info(stopped ? '已停止' : '没有在跑的验收服务')
      } catch (error) {
        handleError(error)
      }
    })

  acc
    .command('render')
    .description('根据轮次和决定灌出 index.html')
    .argument('<name>', '变更名称')
    .option('--json', '输出 JSON')
    .action(async (name: string, options: { json?: boolean }) => {
      try {
        const { workspace } = createContext()
        const manager = new AcceptanceManager(workspace)
        const path = await manager.render(name)
        if (options.json) {
          console.log(JSON.stringify({ path }, null, 2))
          return
        }
        p.intro('Marchen CLI')
        p.log.success(`已写出 ${path}`)
      } catch (error) {
        handleError(error)
      }
    })

  acc
    .command('status')
    .description('查看验收进度')
    .argument('<name>', '变更名称')
    .option('--json', '输出 JSON')
    .action(async (name: string, options: { json?: boolean }) => {
      try {
        const { workspace } = createContext()
        const manager = new AcceptanceManager(workspace)
        const result = await manager.status(name)
        if (options.json) {
          console.log(JSON.stringify(result, null, 2))
          return
        }
        p.intro('Marchen CLI')
        if (!result.exists) {
          p.log.info(`变更 "${name}" 还没有 acceptance/`)
          return
        }
        p.log.info(
          `${name} · ${result.decision?.status ?? '（无 decision.json）'} · ${result.roundCount} 轮`,
        )
        if (result.url) p.log.info(result.url)
      } catch (error) {
        handleError(error)
      }
    })
}

function openBrowser(url: string): void {
  const plat = process.platform
  if (plat === 'darwin')
    spawn('open', [url], { detached: true, stdio: 'ignore' })
  else if (plat === 'win32')
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' })
  else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' })
}
