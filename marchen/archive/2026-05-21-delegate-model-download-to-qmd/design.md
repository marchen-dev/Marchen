## 背景

当前模型下载链路：

```
SearchManager.prepare()
  └─ ModelManager.resolveLocalModels() / ensureModels()
      └─ fetch https://models.suemor.com/qmd/manifest.json (X-Model-Token)
      └─ fs/binary.ts downloadFile + sha256 校验 × 3
      └─ applyEnv(QMD_*_MODEL)
```

该方案是为绕开 HuggingFace 国内访问问题而建（见 `2026-04-26-add-qmd-model-source`）。代价：自建 CDN 运维 + ~250 行 ModelManager + 配套 fs/binary 工具。

`@tobilu/qmd` 内部委托 `node-llama-cpp` 的 `resolveModelFile` 下载模型；`node-llama-cpp` 原生支持 `HF_ENDPOINT` / `MODEL_ENDPOINT` 环境变量，可将下载源切换到 `https://hf-mirror.com` 等国内镜像。已 curl 验证三个模型 URI 在 hf-mirror.com 全部 200/302 可用，总计 ~2.15GB。

## 目标与非目标

**目标：**

- 删除自维护的 ModelManager 和 fs/binary.ts，下载链路完全委托 qmd / node-llama-cpp
- 默认走 `https://hf-mirror.com`，国内用户零配置可用
- 保留 init 阶段的预下载体验（spinner + 进度回调）
- 老 config 升级路径不破坏（`marchen update` 自动补字段）

**非目标：**

- 不迁移老用户 `~/.marchen/models/qmd/` 下的模型（changelog 提示手动 `rm -rf`，让 qmd 默认目录重新下载）
- 不暴露"自定义缓存目录"配置（qmd `createStore` 不透传 `modelCacheDir`，强行自定义会导致缓存不命中）
- 不重新实现 sha256 完整性校验（委托 node-llama-cpp 的 GGUF 头部校验）
- 不内置 ModelScope 等非 HF 协议的镜像（路径结构不兼容，需要专门适配）

## 决策

**D1：委托 node-llama-cpp 的 `resolveModelFile`，而非 qmd 的 `pullModels`**

`pullModels` 在 qmd 的包入口未 re-export（只在 llm.ts 内部 export），从 `@tobilu/qmd` import 不到。`node-llama-cpp` 是 qmd 的传递依赖，`resolveModelFile` 是其官方 public API，支持 `directory` / `onProgress` / `headers` / `cli` 等选项。

**D2：模型 URI 硬编码 + JSDoc 标注 qmd 版本**

qmd 的 `DEFAULT_EMBED_MODEL_URI` / `DEFAULT_GENERATE_MODEL_URI` / `DEFAULT_RERANK_MODEL_URI` 在 `src/llm.ts` 是 export 的，但**未从包入口 re-export**。两种"自动跟随"方案均不可取：

- Deep import `@tobilu/qmd/dist/llm.js` 破坏封装，qmd 内部重构即崩
- 给 qmd 提 PR 解决长期问题，但不阻塞本变更

落地选择：在 `packages/core/src/qmd-models.ts` 硬编码三个 URI 字符串，附 JSDoc 标注 `跟随 @tobilu/qmd@<version> 的 DEFAULT_*_MODEL`。理由：qmd 升级默认模型是语义大事件（向量维度可能变、索引需要重建），自动跟随反而危险，**显式跟随才安全**。

可同步给 qmd 提 PR 把这三个常量 re-export；PR 合并后用 import 替换硬编码，零阻塞。

**D3：下载目录强制对齐 qmd 默认 `~/.cache/qmd/models/`**

qmd 的 `createStore` 不透传 `modelCacheDir`，内部 LlamaCpp 实例锁死在 `process.env.XDG_CACHE_HOME ? join($XDG_CACHE_HOME, 'qmd', 'models') : ~/.cache/qmd/models`。我们用 `resolveModelFile` 自下载时若选别的路径，qmd 会找不到 → 二次下载。

所以代码层维护一份与 qmd 完全相同的路径计算逻辑（常量 `QMD_MODEL_CACHE_DIR`），**不暴露配置项**。这是 qmd 的限制，明确告诉用户"目录不可配"。

**D4：HF 端点解析优先级 `env > config > 代码默认`**

```
process.env.HF_ENDPOINT
  ↓ 不存在
config.yaml: models.endpoint
  ↓ 不存在
代码默认: https://hf-mirror.com
```

三层默认都指向 hf-mirror。env 最高让用户能临时覆盖（如临时切回官方调试）。代码兜底保证老 config 升级期间也能工作。

**D5：`resolveModelFile` 必须传 `cli: false`**

`node-llama-cpp` 的 `resolveModelFile` 默认 `cli: true`，会向 stdout 输出原生进度条，与 `@clack/prompts` 的 spinner 同时写终端会互相覆盖。所有调用强制 `cli: false`，进度仅通过 `onProgress({totalSize, downloadedSize})` 回调上报。

**D6：`ensureModels` 挂在 `SearchManager`，消灭 `ModelManager` 类**

下载逻辑由 SearchManager 内部封装，对外暴露 `ensureModels({ onProgress })`。CLI 的 `init` / `update` 命令通过 SearchManager 调用，不再 import ModelManager。这让"模型生命周期"和"搜索准备"两个职责聚合在一个领域类，且消除了 `ModelManager.applyEnv` 这类副作用接口。

**D7：进度回调字段适配**

node-llama-cpp 回调参数为 `{ totalSize, downloadedSize }`（驼峰、Size 后缀）。现有 `formatModelProgress` 接受 `{ totalBytes, downloadedBytes, stage, model, file }`。SearchManager 内部包装一层，把 node-llama-cpp 的参数映射到现有 shape（`stage` 由调用上下文推断 `downloading` → `ready`，`model` / `file` 由调用方传入）。这样 CLI 端 spinner 渲染代码零改动。

**D8：`node-llama-cpp` 版本锁定 `^3.18.1`**

跟 qmd@2.5.1 锁的版本对齐，pnpm 自动 hoist 去重，避免装两份带原生 binary 的依赖。qmd 升级 node-llama-cpp 时本仓库需同步调整这个 caret 范围。

**D9：`marchen update` 兼容老 config**

参照先例 `2026-05-03-fix-update-missing-providers`，update 命令读取 config 时若缺 `models` 段，自动补 `endpoint: https://hf-mirror.com` 写回。已有 `endpoint` 值不覆盖。

## 风险与权衡

**R1：硬编码 URI 漂移风险**

qmd 升级默认模型后，我们的硬编码会指向旧模型。若 qmd 同时升级了模型架构（如向量维度），用户会得到不一致的 store。

缓解：JSDoc 标明 qmd 锁定版本；升级 qmd 依赖时 review 三个 URI；考虑加 CI 检查脚本对比 qmd 内部常量。

**R2：sha256 校验被取消**

委托 node-llama-cpp 后，本地完整性校验只剩 GGUF 头部 magic-byte 检查（"是不是 HTML 错误页"级别），不再有 sha256 比对。但 HF/hf-mirror 本身有 etag 与文件大小校验，下载完成后 node-llama-cpp 会校验 GGUF 格式，被劫持的概率比自建 CDN 低。

**R3：缓存目录跨工具共享**

`~/.cache/qmd/models/` 也可能被用户独立的 `qmd` CLI 使用。marchen 卸载时**不应**删除该目录（可能影响其它工具）。changelog/README 仅在迁移说明里建议用户手动 `rm -rf ~/.marchen/models/qmd/`（旧路径）。

**R4：node-llama-cpp postinstall 拉 native binary 的网络问题**

`node-llama-cpp` 安装时通过 postinstall 拉取 llama.cpp 的 prebuilt binary（来自 GitHub Releases）。国内用户可能在此阶段卡住。但**此问题在迁移前已存在**（qmd 早已依赖 node-llama-cpp），本变更不引入新副作用。

**R5：hf-mirror.com 可用性依赖第三方**

hf-mirror.com 是社区维护、非官方镜像，若停服影响国内用户。缓解：`models.endpoint` 可配，文档说明如何切换到自建镜像或官方源。

**R6：首次安装 `marchen init` 下载耗时**

~2.15GB 在国内宽带下约 5-15 分钟。spinner UX 已保留，用户能看到进度。无新增风险。

**R7：qmd `createStore` 未来若引入 `modelCacheDir` 透传**

qmd 上游可能在新版本支持自定义缓存目录。届时我们可以让 `QMD_MODEL_CACHE_DIR` 配置化、独立于 qmd 默认目录。当前先不做。
