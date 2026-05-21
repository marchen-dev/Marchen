## 1. 共享层：配置类型与默认值

- [x] 1.1 `packages/shared/src/types.ts`（或对应文件）— `WorkspaceConfig` 接口新增 `models?: { endpoint?: string }`
- [x] 1.2 `packages/shared/src/constants.ts`（或对应文件）— 新增 `DEFAULT_HF_ENDPOINT = 'https://hf-mirror.com'` 常量并导出

## 2. Core 包：新增 qmd-models 常量模块

- [x] 2.1 新建 `packages/core/src/qmd-models.ts`：
    - 硬编码三个 URI 常量 `EMBED_MODEL_URI` / `GENERATE_MODEL_URI` / `RERANK_MODEL_URI`
    - JSDoc 标注「跟随 @tobilu/qmd@2.5.1 的 DEFAULT_*_MODEL，升级 qmd 时需 review」
    - 导出 `QMD_MODEL_CACHE_DIR` 常量（按 `XDG_CACHE_HOME ? join($XDG_CACHE_HOME,'qmd','models') : ~/.cache/qmd/models` 计算）
    - 导出 `QmdModelKind` 类型（`'embed' | 'generate' | 'rerank'`）
- [x] 2.2 在 `packages/core/src/index.ts` 不导出 qmd-models（保持内部使用，外部通过 SearchManager 接触）

## 3. Core 包：SearchManager 重构

- [x] 3.1 `packages/core/src/search-manager.ts` 新增 `ensureModels({ onProgress })` 方法：
    - 读取 workspace config 解析 endpoint（env > config > 默认）
    - `process.env.HF_ENDPOINT ||= resolvedEndpoint`
    - 对三个 URI 依次调用 `resolveModelFile(uri, { directory: QMD_MODEL_CACHE_DIR, cli: false, onProgress: wrapped })`
    - 包装 `{totalSize, downloadedSize}` → 现有 `ModelDownloadProgress` shape `{model, file, stage, downloadedBytes, totalBytes}`
- [x] 3.2 重写 `prepare()`：
    - 设置 `HF_ENDPOINT`（同 ensureModels 的解析逻辑，提取私有方法复用）
    - 直接调用 `initStore()`，删除 ModelManager 调用和 resolveLocalModels 相关代码
    - 保留 `prepared` 幂等标记
- [x] 3.3 抽取私有方法 `resolveHfEndpoint()` 供 ensureModels 和 prepare 复用
- [x] 3.4 `packages/core/src/index.ts` — SearchManager 导出保持不变，新增 `SearchManager.ensureModels` 的相关类型导出（`EnsureModelsOptions`、`ModelDownloadProgress` 沿用现有类型迁移到 search-manager.ts）

## 4. Core 包：Workspace.update 兼容老 config

- [x] 4.1 `packages/core/src/workspace.ts` — `update()` 读取 config 后，若缺 `models.endpoint` 则补 `DEFAULT_HF_ENDPOINT` 并写回
- [x] 4.2 已有 `models.endpoint` 值不覆盖

## 5. Core 包：删除 ModelManager

- [x] 5.1 删除 `packages/core/src/model-manager.ts`
- [x] 5.2 `packages/core/src/index.ts` — 移除 `ModelManager` / `EnsureModelsOptions`（旧）/ `QmdModelPaths` 等相关导出
- [x] 5.3 删除 `packages/core/test/model-manager.test.ts`（如存在）

## 6. Fs 包：删除 binary 模块

- [x] 6.1 删除 `packages/fs/src/binary.ts`
- [x] 6.2 `packages/fs/src/index.ts` — 移除 `downloadFile` / `sha256File` 及相关类型 re-export
- [x] 6.3 删除 `packages/fs/test/binary.test.ts`

## 7. Config 包：模板更新

- [x] 7.1 `packages/config/templates/config.yaml`（或 codegen 源）— 新增 `models:\n  endpoint: https://hf-mirror.com`
    - 实际无独立模板文件，config.yaml 由 `Workspace.initialize()` 直接组装；已在 4.x 顺手补 `configData.models = { endpoint: DEFAULT_HF_ENDPOINT }`
- [x] 7.2 验证 `marchen init` 生成的 config.yaml 包含该字段（留待 9.x 集成验证）

## 8. CLI 包：依赖与命令切换

- [x] 8.1 `apps/cli/package.json` — 在 `dependencies` 新增 `node-llama-cpp: ^3.18.1`
- [x] 8.2 `apps/cli/src/utils/model-progress.ts` — 保持现有 `formatModelProgress` 接口（接受 `{model, file, stage, downloadedBytes, totalBytes}`），不改动
- [x] 8.3 `apps/cli/src/commands/init.ts` — 移除 `ModelManager` import，改用 `new SearchManager(workspace).ensureModels({ onProgress })`，spinner UX 保持不变
- [x] 8.4 `apps/cli/src/commands/update.ts` — 同上替换；`hasLocalModels` 检测改为：统一调 `ensureModels`，通过是否有 `downloading` 事件区分"已就绪"和"已下载"
- [x] 8.5 验证 `apps/cli/tsdown.config.ts` 的 `neverBundle` 已包含 `node-llama-cpp`（应已存在，仅核对）

## 9. 验证

- [x] 9.1 `pnpm install` 通过，pnpm 去重后 node-llama-cpp 只装一份
- [x] 9.2 `pnpm build` 全量构建通过
- [x] 9.3 `pnpm check` 完整检查通过（lint + typecheck + test）
- [x] 9.4 删除本地 `~/.cache/qmd/models/` 后跑 `marchen init` 走启用搜索流程，确认三个模型从 hf-mirror.com 下载到 `~/.cache/qmd/models/`、spinner 进度正常
- [x] 9.5 在已下好模型的环境跑 `marchen search "xxx" --json`，确认 createStore 命中本地缓存、不触发二次下载
- [x] 9.6 临时 `HF_ENDPOINT=https://huggingface.co marchen update` 验证 env 优先级生效
- [x] 9.7 用一份缺 `models` 段的老 config.yaml 跑 `marchen update`，确认自动补齐 `models.endpoint: https://hf-mirror.com`

## 10. 文档

- [x] 10.1 README — 简述模型下载源切换方式（env / config）
- [x] 10.2 归档摘要预备：`changelog.md` 摘要包含「老模型 `~/.marchen/models/qmd/` 可手动删除」的提示（写入归档时使用）
