/**
 * AI 工具集成信息
 *
 * 描述一个 AI 编码工具的 skill/command 目录约定
 */
export interface AgentProvider {
  /** 唯一标识符（kebab-case） */
  readonly id: string
  /** 显示名称 */
  readonly name: string
  /** skill 目录的相对路径（相对于项目根目录） */
  readonly skillDir: string
  /** command 目录的相对路径，仅部分工具支持 */
  readonly commandDir?: string | undefined
}

/**
 * 包边界信息
 *
 * 描述 workspace 中单个包的元数据和依赖关系
 */
export interface PackageBoundary {
  readonly name: string
  readonly dependsOn: readonly string[]
}

/** 变更状态 */
export type ChangeStatus = 'open' | 'archived'

/**
 * 变更元数据
 *
 * 记录变更的基本信息，存储在 .metadata.yaml 中
 */
export interface ChangeMetadata {
  /** 变更名称（kebab-case） */
  readonly name: string
  /** 使用的 schema 名称 */
  readonly schema: string
  /** 创建时间（ISO 8601） */
  readonly createdAt: string
  /** 当前状态 */
  readonly status: ChangeStatus
}

// ============================================================
// Idea 生命周期
// ============================================================

/** Idea Markdown frontmatter 中的结构化元数据 */
export interface IdeaMetadata {
  /** 文档格式版本 */
  readonly format: number
  /** 面向人的标题 */
  readonly title: string
  /** 用于轻量语义判断的一句话摘要 */
  readonly summary: string
  /** 可选的主题标签 */
  readonly tags: readonly string[]
  /** 创建时间（ISO 8601） */
  readonly createdAt: string
  /** 最后更新时间（ISO 8601） */
  readonly updatedAt: string
}

/** Idea 列表中的轻量条目，不包含正文 */
export interface IdeaSummary extends IdeaMetadata {
  /** 由 Markdown 文件名派生的唯一名称 */
  readonly name: string
}

/** 完整 Idea 文档 */
export interface IdeaDocument {
  /** 由 Markdown 文件名派生的唯一名称 */
  readonly name: string
  /** 结构化元数据 */
  readonly metadata: IdeaMetadata
  /** 不含 frontmatter 的 Markdown 正文 */
  readonly body: string
  /** 规范化后的完整 Markdown */
  readonly markdown: string
  /** 完整 Markdown 内容的 SHA-256 修订值 */
  readonly revision: string
}

/** Idea 列举过程中单个不可解析文件的问题 */
export interface IdeaListIssue {
  /** 由文件名派生的名称 */
  readonly name: string
  /** 可供人和 Skill 定位问题的说明 */
  readonly message: string
}

/** Idea 列举结果 */
export interface IdeaListResult {
  /** 可正常读取的 idea，按更新时间倒序排列 */
  readonly ideas: readonly IdeaSummary[]
  /** 未阻塞整体列举的单文件问题 */
  readonly issues: readonly IdeaListIssue[]
}

/** Idea 创建或更新结果 */
export interface IdeaWriteResult {
  /** Idea 名称 */
  readonly name: string
  /** 工作区内相对路径 */
  readonly path: string
  /** 写入后的修订值 */
  readonly revision: string
}

/** Idea 删除结果 */
export interface IdeaRemoveResult {
  /** 被删除的 Idea 名称 */
  readonly name: string
  /** 删除前的工作区内相对路径 */
  readonly path: string
}

/** 单个已晋升 Idea 的路径信息 */
export interface PromotedIdea {
  /** Idea 名称 */
  readonly name: string
  /** 晋升前的工作区内相对路径 */
  readonly from: string
  /** 晋升后的工作区内相对路径 */
  readonly to: string
}

/** Idea 批量晋升结果 */
export interface IdeaPromoteResult {
  /** 目标 open change */
  readonly change: string
  /** 已晋升的 Idea 列表 */
  readonly ideas: readonly PromotedIdea[]
}

/**
 * Artifact 定义
 *
 * 描述 schema 中单个制品的结构
 */
export interface ArtifactDefinition {
  /** 制品标识符（如 'proposal'、'design'） */
  readonly id: string
  /** 生成的文件路径（如 'proposal.md'、'specs/'） */
  readonly generates: string
  /** 依赖的其他 artifact ID 列表 */
  readonly requires: readonly string[]
  /** 初始 markdown 骨架模板，目录类型（如 specs）无模板 */
  readonly template?: string
  /** 给 LLM 的指导文本，告诉 AI 如何填充该 artifact */
  readonly instruction: string
}

/**
 * Schema 定义
 *
 * 描述一个工作流 schema 包含的所有 artifact 及其关系
 */
export interface SchemaDefinition {
  /** Schema 名称 */
  readonly name: string
  /** 包含的 artifact 定义列表 */
  readonly artifacts: readonly ArtifactDefinition[]
}

/**
 * 单个 task 条目
 *
 * 对应 tasks.md 中的一个 checkbox 行
 */
export interface TaskItem {
  /** 任务描述文字 */
  readonly description: string
  /** 是否已完成 */
  readonly completed: boolean
}

// ============================================================
// Artifact 内容状态（status 命令）
// ============================================================

/**
 * Artifact 内容状态
 *
 * 仅表达内容维度，不包含 tasks 完成进度
 * - empty: 文件存在，内容为模板骨架
 * - filled: 文件存在，有实质内容
 * - missing: 文件不存在
 * - no-content: 目录存在但为空（仅 specs）
 */
export type ArtifactContentStatus =
  | 'empty'
  | 'filled'
  | 'missing'
  | 'no-content'

/**
 * 单个 artifact 的状态详情
 */
export interface ArtifactStatusDetail {
  /** artifact 标识符 */
  readonly id: string
  /** 内容状态 */
  readonly status: ArtifactContentStatus
  /** 文件/目录路径（相对于变更目录） */
  readonly path: string
  /** specs 类型时，子目录名列表（capability 名称） */
  readonly capabilities?: readonly string[]
}

/**
 * 工作流状态
 *
 * 根据 artifact 依赖关系和内容状态计算
 */
export interface WorkflowStatus {
  /** 建议的下一步 artifact，全部完成时为 null */
  readonly next: string | null
  /** 可以开始的 artifact 列表 */
  readonly ready: readonly string[]
  /** 被阻塞的 artifact 列表 */
  readonly blocked: readonly string[]
}

/**
 * status 命令的返回结果
 */
export interface StatusResult {
  /** 变更名称 */
  readonly name: string
  /** schema 名称 */
  readonly schema: string
  /** 各 artifact 的状态详情 */
  readonly artifacts: readonly ArtifactStatusDetail[]
  /** 工作流状态 */
  readonly workflow: WorkflowStatus
  /** task 完成信息，tasks.md 无实质内容时为 null */
  readonly tasks: {
    readonly total: number
    readonly completed: number
    readonly items: readonly TaskItem[]
  } | null
}

// ============================================================
// Instructions 命令
// ============================================================

/**
 * 上下文 artifact 的信息
 */
export interface ContextInfo {
  /** artifact 标识符 */
  readonly id: string
  /** 内容状态 */
  readonly status: ArtifactContentStatus
  /** 文件/目录路径（相对于变更目录） */
  readonly path: string
  /** 文件内容，filled 时为实际内容，否则为 null；specs 目录自动拼接 */
  readonly content: string | null
}

/** apply 阶段的状态 */
export type ApplyState = 'ready' | 'blocked' | 'all_done'

/** apply 阶段的任务进度 */
export interface ApplyProgress {
  readonly total: number
  readonly completed: number
  readonly remaining: number
}

/**
 * instructions 命令的返回结果
 */
export interface InstructionsResult {
  /** 变更名称 */
  readonly changeName: string
  /** artifact 标识符 */
  readonly artifactId: string
  /** schema 名称 */
  readonly schemaName: string
  /** 变更目录绝对路径 */
  readonly changeDir: string
  /** 输出路径（相对于变更目录），apply 时为 null */
  readonly outputPath: string | null
  /** 模板内容，apply 时为 null */
  readonly template: string | null
  /** 给 LLM 的指导文本 */
  readonly instruction: string
  /** 上下文 artifacts 的信息 */
  readonly context: readonly ContextInfo[]
  /** 完成后解锁的 artifact 列表，apply 时为 null */
  readonly unlocks: readonly string[] | null
  /** apply 阶段的状态，创建 artifact 时为 null */
  readonly state: ApplyState | null
  /** apply 阶段的任务进度，创建 artifact 时为 null */
  readonly progress: ApplyProgress | null
}

/**
 * 归档操作结果
 */
export interface ArchiveResult {
  /** 变更名称 */
  readonly name: string
  /** 使用的 schema */
  readonly schema: string
  /** 归档目标路径 */
  readonly archivedTo: string
  /** 归档时间（ISO 8601） */
  readonly archivedAt: string
}

/**
 * 归档操作选项
 */
export interface ArchiveOptions {
  /** 变更摘要（写入 changelog） */
  readonly summary?: string | undefined
}

/** 人在验收页上的整单决定 */
export type DecisionStatus = 'pending' | 'accepted' | 'rejected'

/**
 * 验收页上的一条待修改项
 */
export interface AcceptanceDecisionItem {
  /** 对齐 plan / case 的稳定 id；同一验收目标跨轮不得变化 */
  readonly id: string
  /** 人填写的修改理由 */
  readonly comment: string
  /** 相对 index.html 的附图路径 */
  readonly images: readonly string[]
}

/**
 * 解析后的 decision.json
 */
export interface AcceptanceDecision {
  readonly status: DecisionStatus
  readonly items: readonly AcceptanceDecisionItem[]
}

/**
 * 一轮取证的摘要（给灌页和 status 用）
 */
export interface AcceptanceRoundSummary {
  readonly index: number
  readonly title: string
  readonly verdict: string
  readonly conclusion: string
  readonly result: unknown
  /** 开下一轮前冻住的人工决定；旧轮次可能没有 */
  readonly humanDecision: AcceptanceDecision | null
}

/**
 * `marchen acceptance status` 的返回
 */
export interface AcceptanceStatusResult {
  readonly name: string
  /** 是否存在 acceptance/ 目录 */
  readonly exists: boolean
  readonly requirement: string | null
  /** 没有 decision.json 时为 null，不是 accepted */
  readonly decision: AcceptanceDecision | null
  readonly roundCount: number
  readonly rounds: readonly AcceptanceRoundSummary[]
  readonly serving: boolean
  readonly url: string | null
}

/**
 * serve 启动结果
 */
export interface AcceptanceServeResult {
  readonly name: string
  readonly url: string
  readonly port: number
  readonly token: string
  readonly reused: boolean
}

/**
 * 更新操作结果
 */
export interface UpdateResult {
  /** 更新前的版本号，旧项目无 version 时为 null */
  readonly previousVersion: string | null
  /** 更新后的版本号 */
  readonly currentVersion: string
  /** 已更新的 provider 名称列表 */
  readonly providersUpdated: readonly string[]
  /** 更新的 skill 文件数量 */
  readonly skillCount: number
  /** 更新的 command 文件数量 */
  readonly commandCount: number
}

// ============================================================
// 工作区配置（config.yaml）
// ============================================================

/**
 * 工作区配置
 *
 * 对应 config.yaml 的结构
 */
export interface WorkspaceConfig {
  /** 默认 schema */
  readonly schema: string
  /** 已安装的 AI 工具 provider ID 列表 */
  readonly providers: readonly string[]
  /** CLI 版本号 */
  readonly version?: string
}
