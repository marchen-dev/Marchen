import type { HybridQueryResult, QMDStore } from '@tobilu/qmd'
import type {
  ModelDownloadProgress,
  ModelDownloadStage,
  QmdModelKind,
} from './qmd-models.js'
import type { Workspace } from './workspace.js'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { DEFAULT_HF_ENDPOINT } from '@marchen-spec/shared'
import { QMD_MODEL_CACHE_DIR, QMD_MODEL_URIS } from './qmd-models.js'

/** 搜索结果项 */
export interface SearchResult {
  readonly path: string
  readonly title: string
  readonly score: number
  readonly snippet: string
  readonly context?: string
}

/** 搜索选项 */
export interface SearchOptions {
  readonly limit?: number
  readonly minScore?: number
}

/** ensureModels 选项 */
export interface EnsureModelsOptions {
  readonly onProgress?: (progress: ModelDownloadProgress) => void
}

/**
 * 搜索管理器
 *
 * 封装 qmd SDK，提供 Hybrid Search、模型下载和索引管理接口。
 * 调用方在 search.enabled: true 时才应使用此类。
 */
export class SearchManager {
  private store: QMDStore | null = null
  private available: boolean | null = null
  private prepared = false

  constructor(private readonly workspace: Workspace) {}

  /** 检测 qmd SDK 是否可用 */
  async isAvailable(): Promise<boolean> {
    if (this.available !== null) return this.available
    try {
      await import('@tobilu/qmd')
      this.available = true
    } catch {
      this.available = false
    }
    return this.available
  }

  /**
   * 下载三个 QMD 模型到 qmd 默认缓存目录。
   *
   * 通过 node-llama-cpp 的 `resolveModelFile` 完成下载，下载源由
   * `HF_ENDPOINT` 环境变量决定，缓存目录强制对齐 qmd 默认值
   * （见 qmd-models.ts 的 QMD_MODEL_CACHE_DIR 注释）。
   *
   * 进度通过 onProgress 回调上报，封装为现有 ModelDownloadProgress 格式。
   */
  async ensureModels(options?: EnsureModelsOptions): Promise<void> {
    await this.applyHfEndpoint()

    const { resolveModelFile } = await import('node-llama-cpp')

    const kinds: QmdModelKind[] = ['embed', 'generate', 'rerank']
    for (const model of kinds) {
      const uri = QMD_MODEL_URIS[model]
      const file = uri.split('/').pop() ?? uri
      const emit = (
        stage: ModelDownloadStage,
        downloadedBytes?: number,
        totalBytes?: number | null,
      ): void => {
        options?.onProgress?.({
          model,
          file,
          stage,
          downloadedBytes,
          totalBytes,
        })
      }

      emit('checking')
      await resolveModelFile(uri, {
        directory: QMD_MODEL_CACHE_DIR,
        cli: false,
        onProgress: ({ totalSize, downloadedSize }) => {
          emit('downloading', downloadedSize, totalSize)
        },
      })
      emit('ready')
    }
  }

  /**
   * 准备搜索引擎。
   *
   * 设置 HF_ENDPOINT 环境变量并初始化 qmd store，不再下载模型。
   * 幂等，重复调用立即返回。
   */
  async prepare(): Promise<void> {
    if (this.prepared) return
    await this.applyHfEndpoint()
    await this.initStore()
    this.prepared = true
  }

  /** 搜索归档内容 */
  async search(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult[]> {
    const store = await this.getStore()
    await this.ensureIndexed(store)
    const limit = options?.limit ?? 5
    const minScore = options?.minScore ?? 0.3

    return this.hybridSearch(store, query, limit, minScore)
  }

  /** 全量索引（扫描 + embedding） */
  async index(): Promise<void> {
    const store = await this.getStore()
    await store.update({ collections: ['archive'] })
    await store.embed()
  }

  /** 增量索引（archive 后调用） */
  async indexChange(): Promise<void> {
    const store = await this.getStore()
    await store.update({ collections: ['archive'] })
    await store.embed()
  }

  /** 释放资源 */
  async close(): Promise<void> {
    await this.store?.close()
    this.store = null
    this.prepared = false
  }

  /** 索引为空时自动触发首次扫描 */
  private async ensureIndexed(store: QMDStore): Promise<void> {
    const status = await store.getStatus()
    if (status.totalDocuments === 0) {
      await store.update({ collections: ['archive'] })
      await store.embed()
    }
  }

  /** Hybrid Search（BM25 + Vector + Reranking） */
  private async hybridSearch(
    store: QMDStore,
    query: string,
    limit: number,
    minScore: number,
  ): Promise<SearchResult[]> {
    const results = await store.search({ query, limit, minScore })
    return results.map((r: HybridQueryResult) => {
      const result: SearchResult = {
        path: r.displayPath,
        title: r.title,
        score: r.score,
        snippet: r.bestChunk,
      }
      if (r.context) {
        return { ...result, context: r.context }
      }
      return result
    })
  }

  /** 确保 store 就绪，未 prepare 时自动触发 */
  private async getStore(): Promise<QMDStore> {
    if (!this.prepared) await this.prepare()
    return this.store!
  }

  /** 初始化 qmd store */
  private async initStore(): Promise<void> {
    const { createStore } = await import('@tobilu/qmd')
    await mkdir(dirname(this.workspace.searchDbPath), { recursive: true })
    this.store = await createStore({
      dbPath: this.workspace.searchDbPath,
      config: {
        collections: {
          archive: {
            path: this.workspace.archiveDir,
            pattern: '**/*.md',
          },
        },
      },
    })
    await this.store.addContext(
      'archive',
      '/',
      'MarchenSpec 变更历史归档，包含 proposal（动机）、design（设计决策）、specs（规格）、tasks（任务清单）',
    )
  }

  /**
   * 解析并应用 HF 端点到 process.env.HF_ENDPOINT。
   *
   * 优先级：已设置的 env > config.models.endpoint > DEFAULT_HF_ENDPOINT。
   * 不覆盖已存在的 env 值，保证用户能临时覆盖配置。
   */
  private async applyHfEndpoint(): Promise<void> {
    if (process.env.HF_ENDPOINT) return
    const endpoint = await this.resolveHfEndpoint()
    process.env.HF_ENDPOINT = endpoint
  }

  /** 从 workspace config 读取 endpoint，缺失时返回默认值 */
  private async resolveHfEndpoint(): Promise<string> {
    try {
      const config = await this.workspace.readConfig()
      return config.models?.endpoint ?? DEFAULT_HF_ENDPOINT
    } catch {
      return DEFAULT_HF_ENDPOINT
    }
  }
}
