import { homedir } from 'node:os'
import { join } from 'node:path'

/** QMD 模型类型 */
export type QmdModelKind = 'embed' | 'generate' | 'rerank'

/** 模型下载阶段 */
export type ModelDownloadStage =
  | 'checking'
  | 'downloading'
  | 'verifying'
  | 'ready'

/** 单次模型下载进度 */
export interface ModelDownloadProgress {
  readonly model: QmdModelKind
  readonly file: string
  readonly stage: ModelDownloadStage
  readonly downloadedBytes?: number | undefined
  readonly totalBytes?: number | null | undefined
}

/**
 * QMD 模型 HuggingFace URI
 *
 * 跟随 @tobilu/qmd@2.5.1 的 DEFAULT_EMBED_MODEL / DEFAULT_GENERATE_MODEL /
 * DEFAULT_RERANK_MODEL。qmd 升级时需 review 是否同步更新。
 *
 * 不通过 import 自动跟随的原因：qmd 包入口未 re-export 这些常量，
 * 且默认模型变更属于语义大事件（向量维度可能变、索引需重建），
 * 显式跟随比自动跟随更安全。
 */
export const QMD_MODEL_URIS: Record<QmdModelKind, string> = {
  embed: 'hf:ggml-org/embeddinggemma-300M-GGUF/embeddinggemma-300M-Q8_0.gguf',
  generate:
    'hf:tobil/qmd-query-expansion-1.7B-gguf/qmd-query-expansion-1.7B-q4_k_m.gguf',
  rerank:
    'hf:ggml-org/Qwen3-Reranker-0.6B-Q8_0-GGUF/qwen3-reranker-0.6b-q8_0.gguf',
}

/**
 * QMD 默认模型缓存目录
 *
 * 必须与 qmd 内部 `MODEL_CACHE_DIR` 完全一致，否则 createStore 找不到我们
 * 下载的文件会触发二次下载。qmd `createStore` 未透传 modelCacheDir 配置，
 * 此目录由 qmd 单方面决定，本项目不暴露为可配置项。
 */
export const QMD_MODEL_CACHE_DIR = process.env.XDG_CACHE_HOME
  ? join(process.env.XDG_CACHE_HOME, 'qmd', 'models')
  : join(homedir(), '.cache', 'qmd', 'models')
