import type {
  IdeaDocument,
  IdeaListResult,
  IdeaMetadata,
  IdeaPromoteResult,
  IdeaRemoveResult,
  IdeaSummary,
  IdeaWriteResult,
  PromotedIdea,
} from '@marchen/shared'
import type { Workspace } from './workspace.js'
import { createHash } from 'node:crypto'
import { basename, join, relative } from 'node:path'
import {
  ensureDir,
  exists,
  listDir,
  moveFile,
  parseYaml,
  readFile,
  removeFile,
  replaceFileAtomic,
  stringifyYaml,
  writeFileExclusive,
} from '@marchen/fs'
import {
  EXPLORATION_DIRECTORY_NAME,
  IDEA_FORMAT_VERSION,
  StateError,
  ValidationError,
} from '@marchen/shared'
import { ChangeManager } from './change-manager.js'

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/

interface IdeaCandidate {
  readonly title: string
  readonly summary: string
  readonly tags: readonly string[]
  readonly body: string
}

/** 创建或更新 Idea 时的输入 */
export interface IdeaWriteInput {
  /** 包含 title、summary、tags frontmatter 和正文的候选 Markdown */
  readonly markdown: string
}

/** 更新 Idea 时的输入 */
export interface IdeaUpdateInput extends IdeaWriteInput {
  /** 调用方读取内容时拿到的预期修订值 */
  readonly expectedRevision: string
}

/**
 * 尚未晋升想法的领域管理器
 *
 * 统一处理 Markdown 契约、修订保护和向正式 change 的生命周期晋升。
 */
export class IdeaManager {
  /**
   * @param workspace - 工作区路径上下文
   * @param changes - 正式变更管理器，用于校验晋升前置状态
   */
  constructor(
    private readonly workspace: Workspace,
    private readonly changes: ChangeManager,
  ) {}

  /**
   * 校验 Idea 名称是否为合法 kebab-case
   *
   * @param name - Idea 名称
   */
  static isValidName(name: string): boolean {
    return ChangeManager.isValidName(name)
  }

  /** 列举所有可读取 Idea，并把单文件错误降级为 issues */
  async list(): Promise<IdeaListResult> {
    await this.ensureInitialized()
    if (!(await exists(this.workspace.ideaDir))) {
      return { ideas: [], issues: [] }
    }

    const ideas: IdeaSummary[] = []
    const issues: IdeaListResult['issues'][number][] = []
    for (const entry of await listDir(this.workspace.ideaDir)) {
      if (!entry.endsWith('.md')) continue
      const name = basename(entry, '.md')
      try {
        this.assertValidName(name)
        const markdown = await readFile(join(this.workspace.ideaDir, entry))
        const parsed = this.parseStored(markdown, entry)
        ideas.push({ name, ...parsed.metadata })
      } catch (error) {
        issues.push({
          name,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }

    ideas.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    return { ideas, issues }
  }

  /**
   * 读取完整 Idea
   *
   * @param name - Idea 名称
   */
  async show(name: string): Promise<IdeaDocument> {
    await this.ensureInitialized()
    this.assertValidName(name)
    const markdown = await readFile(this.ideaPath(name))
    const parsed = this.parseStored(markdown, `${name}.md`)
    return {
      name,
      metadata: parsed.metadata,
      body: parsed.body,
      markdown,
      revision: this.revision(markdown),
    }
  }

  /**
   * 创建 Idea，已有同名文件时拒绝覆盖
   *
   * @param name - Idea 名称
   * @param input - 候选 Markdown
   */
  async create(name: string, input: IdeaWriteInput): Promise<IdeaWriteResult> {
    await this.ensureInitialized()
    this.assertValidName(name)
    const candidate = this.parseCandidate(input.markdown, `${name}.md`)
    const now = new Date().toISOString()
    const metadata: IdeaMetadata = {
      format: IDEA_FORMAT_VERSION,
      title: candidate.title,
      summary: candidate.summary,
      tags: candidate.tags,
      createdAt: now,
      updatedAt: now,
    }
    const markdown = this.serialize(metadata, candidate.body)

    try {
      await writeFileExclusive(this.ideaPath(name), markdown)
    } catch (error) {
      if (await exists(this.ideaPath(name))) {
        throw new ValidationError(`Idea "${name}" 已存在`)
      }
      throw error
    }

    return this.writeResult(name, markdown)
  }

  /**
   * 使用预期 revision 更新 Idea
   *
   * @param name - Idea 名称
   * @param input - 候选 Markdown 与预期修订值
   */
  async update(name: string, input: IdeaUpdateInput): Promise<IdeaWriteResult> {
    await this.ensureInitialized()
    this.assertValidName(name)
    const path = this.ideaPath(name)
    const currentMarkdown = await readFile(path)
    const currentRevision = this.revision(currentMarkdown)
    if (currentRevision !== input.expectedRevision) {
      throw new StateError(
        `Idea "${name}" 已被修改，revision 不匹配`,
        `重新运行 marchen idea show ${name} --json 后调和内容`,
      )
    }

    const current = this.parseStored(currentMarkdown, `${name}.md`)
    const candidate = this.parseCandidate(input.markdown, `${name}.md`)
    const metadata: IdeaMetadata = {
      format: IDEA_FORMAT_VERSION,
      title: candidate.title,
      summary: candidate.summary,
      tags: candidate.tags,
      createdAt: current.metadata.createdAt,
      updatedAt: new Date().toISOString(),
    }
    const markdown = this.serialize(metadata, candidate.body)
    await replaceFileAtomic(path, markdown)
    return this.writeResult(name, markdown)
  }

  /**
   * 删除未晋升 Idea
   *
   * @param name - Idea 名称
   */
  async remove(name: string): Promise<IdeaRemoveResult> {
    await this.ensureInitialized()
    this.assertValidName(name)
    const path = this.ideaPath(name)
    if (!(await exists(path))) {
      throw new ValidationError(`Idea "${name}" 不存在`)
    }
    await removeFile(path)
    return { name, path: this.relativePath(path) }
  }

  /**
   * 把一个或多个 Idea 晋升到已完成规划的 open change
   *
   * @param names - 待晋升 Idea 名称
   * @param changeName - 目标 change 名称
   */
  async promote(
    names: readonly string[],
    changeName: string,
  ): Promise<IdeaPromoteResult> {
    await this.ensureInitialized()
    if (names.length === 0) {
      throw new ValidationError('至少需要提供一个 Idea 名称')
    }
    if (new Set(names).size !== names.length) {
      throw new ValidationError('Idea 名称不能重复')
    }
    for (const name of names) this.assertValidName(name)

    const openChange = (await this.changes.list()).find(
      (change) => change.name === changeName && change.status === 'open',
    )
    if (!openChange) {
      throw new ValidationError(`Open 变更 "${changeName}" 不存在`)
    }
    const status = await this.changes.status(changeName)
    if (status.workflow.next !== null) {
      throw new StateError(
        `变更 "${changeName}" 的规划产物尚未就绪`,
        `先完成 ${status.workflow.next}`,
      )
    }

    const targetDir = join(
      this.workspace.changeDir,
      changeName,
      EXPLORATION_DIRECTORY_NAME,
    )
    const planned: PromotedIdea[] = []
    for (const name of names) {
      await this.show(name)
      const source = this.ideaPath(name)
      const destination = join(targetDir, `${name}.md`)
      if (await exists(destination)) {
        throw new ValidationError(
          `变更 "${changeName}" 已存在同名探索记录 "${name}"`,
        )
      }
      planned.push({
        name,
        from: this.relativePath(source),
        to: this.relativePath(destination),
      })
    }

    await ensureDir(targetDir)
    const moved: PromotedIdea[] = []
    try {
      for (const item of planned) {
        await moveFile(
          join(this.workspace.root, item.from),
          join(this.workspace.root, item.to),
        )
        moved.push(item)
      }
    } catch (error) {
      const rollbackFailures: string[] = []
      for (const item of [...moved].reverse()) {
        try {
          await moveFile(
            join(this.workspace.root, item.to),
            join(this.workspace.root, item.from),
          )
        } catch (rollbackError) {
          rollbackFailures.push(
            `${item.name}: ${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`,
          )
        }
      }
      const original = error instanceof Error ? error.message : String(error)
      const rollback =
        rollbackFailures.length > 0
          ? `；回滚失败：${rollbackFailures.join('；')}`
          : '；已回滚先前移动'
      throw new StateError(`Idea 晋升失败：${original}${rollback}`)
    }

    return { change: changeName, ideas: planned }
  }

  /** 解析候选 Markdown 中由 Skill 提供的字段 */
  private parseCandidate(markdown: string, source: string): IdeaCandidate {
    const match = FRONTMATTER_PATTERN.exec(markdown)
    if (!match) {
      throw new ValidationError(`Idea "${source}" 缺少有效 frontmatter`)
    }
    const data = parseYaml<Record<string, unknown>>(match[1]!, source)
    const title = this.nonEmptyString(data?.title, 'title', source)
    const summary = this.nonEmptyString(data?.summary, 'summary', source)
    const tags = data?.tags ?? []
    if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
      throw new ValidationError(`Idea "${source}" 的 tags 必须是字符串数组`)
    }
    const body = match[2]!.trim()
    if (!body) {
      throw new ValidationError(`Idea "${source}" 的正文不能为空`)
    }
    return { title, summary, tags, body }
  }

  /** 解析并严格校验已存储 Markdown */
  private parseStored(
    markdown: string,
    source: string,
  ): { metadata: IdeaMetadata; body: string } {
    const candidate = this.parseCandidate(markdown, source)
    const match = FRONTMATTER_PATTERN.exec(markdown)!
    const data = parseYaml<Record<string, unknown>>(match[1]!, source)
    if (data.format !== IDEA_FORMAT_VERSION) {
      throw new ValidationError(
        `Idea "${source}" 的 format 不受支持：${String(data.format)}`,
      )
    }
    const createdAt = this.isoDate(data.createdAt, 'createdAt', source)
    const updatedAt = this.isoDate(data.updatedAt, 'updatedAt', source)
    return {
      metadata: {
        format: IDEA_FORMAT_VERSION,
        title: candidate.title,
        summary: candidate.summary,
        tags: candidate.tags,
        createdAt,
        updatedAt,
      },
      body: candidate.body,
    }
  }

  /** 将 Idea 元数据和正文序列化为规范 Markdown */
  private serialize(metadata: IdeaMetadata, body: string): string {
    return `---\n${stringifyYaml(metadata)}---\n\n${body.trim()}\n`
  }

  /** 计算完整 Markdown 的稳定修订值 */
  private revision(markdown: string): string {
    return `sha256:${createHash('sha256').update(markdown).digest('hex')}`
  }

  /** 构建写入结果 */
  private writeResult(name: string, markdown: string): IdeaWriteResult {
    return {
      name,
      path: this.relativePath(this.ideaPath(name)),
      revision: this.revision(markdown),
    }
  }

  /** 获取 Idea 绝对路径 */
  private ideaPath(name: string): string {
    return join(this.workspace.ideaDir, `${name}.md`)
  }

  /** 转为工作区相对路径 */
  private relativePath(path: string): string {
    return relative(this.workspace.root, path)
  }

  /** 校验名称并阻止路径逃逸 */
  private assertValidName(name: string): void {
    if (!IdeaManager.isValidName(name)) {
      throw new ValidationError(
        `Idea 名称 "${name}" 不合法，请使用 kebab-case 格式（如 auth-refresh）`,
      )
    }
  }

  /** 读取非空字符串字段 */
  private nonEmptyString(
    value: unknown,
    field: string,
    source: string,
  ): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new ValidationError(`Idea "${source}" 的 ${field} 必须是非空字符串`)
    }
    return value.trim()
  }

  /** 读取严格 ISO 8601 时间字段 */
  private isoDate(value: unknown, field: string, source: string): string {
    if (
      typeof value !== 'string' ||
      Number.isNaN(Date.parse(value)) ||
      new Date(value).toISOString() !== value
    ) {
      throw new ValidationError(
        `Idea "${source}" 的 ${field} 不是有效 ISO 时间`,
      )
    }
    return value
  }

  /** 确保工作区已经初始化 */
  private async ensureInitialized(): Promise<void> {
    if (!(await this.workspace.isInitialized())) {
      throw new StateError('Marchen 尚未初始化', '运行 marchen init 初始化')
    }
  }
}
