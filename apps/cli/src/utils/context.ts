import { ChangeManager, IdeaManager, Workspace } from '@marchen/core'

/**
 * 创建 CLI 上下文，包含 workspace 和 change manager 实例
 */
export function createContext(): {
  workspace: Workspace
  changes: ChangeManager
  ideas: IdeaManager
} {
  const workspace = new Workspace()
  const changes = new ChangeManager(workspace)
  const ideas = new IdeaManager(workspace, changes)
  return { workspace, changes, ideas }
}
