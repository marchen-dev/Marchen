## 动机

当前 `ModelManager` 从自建 CDN（`https://models.suemor.com/qmd/manifest.json`）下载三个 GGUF 模型（~2GB），最初是为了绕开 HuggingFace 在国内访问慢/不通的问题。但这带来了三类持续成本：

1. **运维负担**：自建 CDN 需要维护带宽、auth token、manifest 同步、sha256 校验等基础设施
2. **代码负担**：`ModelManager` (~250 行) + `fs/binary.ts`（下载/sha256）+ 配套测试
3. **演进负担**：qmd 升级默认模型时，我们需要手动同步 manifest

社区已有成熟的国内 HuggingFace 镜像（`https://hf-mirror.com`），qmd 底层的 node-llama-cpp 原生支持通过 `HF_ENDPOINT` 环境变量切换下载源。可以把下载链路完全委托给 qmd 生态，删除自维护逻辑，CDN 退役。

## 变更内容

- 删除 `@marchen-spec/core` 的 `ModelManager` 类和 `@marchen-spec/fs` 的 `binary.ts` 模块（含下载/sha256/测试）
- `SearchManager` 新增 `ensureModels()` 方法，内部调用 node-llama-cpp 的 `resolveModelFile` 完成下载，进度回调适配现有 spinner UX
- `SearchManager.prepare()` 改为仅设置 `HF_ENDPOINT` 环境变量并初始化 store，不再触发下载
- `config.yaml` 新增 `models.endpoint` 字段，默认值 `https://hf-mirror.com`
- `marchen init` 启用搜索时改用 `SearchManager.ensureModels()`
- `marchen update` 改用 `SearchManager.ensureModels()`，并给老 config 兜底补 `models.endpoint`
- `apps/cli` 新增直接依赖 `node-llama-cpp ^3.18.1`（与 qmd 锁定版本对齐，pnpm 自动去重）
- 自建 CDN `models.suemor.com` 退役（独立运维动作，本变更不覆盖）

## 能力

### 新增能力

- `hf-endpoint-config`：通过 `config.yaml` 的 `models.endpoint` 字段和 `HF_ENDPOINT` 环境变量控制 HuggingFace 下载源，默认走 hf-mirror.com

### 修改能力

- `model-manager`：从自建 manifest 下载迁移到委托 node-llama-cpp `resolveModelFile`，缓存目录对齐 qmd 默认（`~/.cache/qmd/models`），删除 sha256 校验
- `search-prepare`：去除下载职责，仅负责设置环境变量和初始化 store
- `binary-file-ops`：移除（不再需要通用下载/sha256 工具）

## 影响范围

- `packages/core/src/model-manager.ts` — 删除
- `packages/core/src/search-manager.ts` — 新增 `ensureModels()`，重构 `prepare()`
- `packages/core/src/index.ts` — 移除 ModelManager 导出
- `packages/fs/src/binary.ts` — 删除
- `packages/fs/src/index.ts` — 移除 binary re-export
- `packages/fs/test/binary.test.ts` — 删除
- `packages/shared/src/types.ts`（或对应配置类型文件）— `WorkspaceConfig` 增加 `models.endpoint?`
- `packages/config/templates/config.yaml` — 模板加 `models.endpoint`
- `packages/core/src/workspace.ts` — `update()` 补 `models.endpoint` fallback
- `apps/cli/src/commands/init.ts` — 切换到 `SearchManager.ensureModels()`
- `apps/cli/src/commands/update.ts` — 同上
- `apps/cli/src/utils/model-progress.ts` — 适配 `{totalSize, downloadedSize}` 字段
- `apps/cli/package.json` — 新增 `node-llama-cpp ^3.18.1` 依赖
- `apps/cli/tsdown.config.ts` — 已 neverBundle，无需改动
