## 动机

Marchen 当前把项目历史搜索作为内置能力：CLI 暴露 `marchen search`，Core 集成 QMD，`init`/`update` 管理约 2GB 模型，`archive` 自动维护本地索引，Skill 模板依赖搜索恢复历史上下文。这条链路引入了原生依赖、模型下载、索引延迟和持续维护成本，但归档历史本身已经有 `changelog.md` 摘要索引，AI 也可以按摘要确定性读取对应 archive。

搜索还是一项横跨 CLI、Core、配置、依赖与生成模板的可选功能。仅删除命令会留下模型下载、归档索引、废弃配置和错误的 Skill 指引，因此需要把项目内搜索作为一个整体退役，同时为旧工作区提供清晰、安全的迁移行为。

## 变更内容

- 移除 `marchen search` 命令、SearchManager、QMD 模型定义和 archive 自动索引。
- `marchen init` 不再询问是否启用搜索，不创建 `.search` 目录，也不写入 `search`、`models` 配置。
- `marchen update` 清理 Marchen 自有配置中的废弃 `search`、`models` 字段，并用最新版模板覆盖托管的 Skill/Command 文件。
- 移除 `@tobilu/qmd`、`node-llama-cpp`、模型进度 UI、构建 external 配置及对应 lockfile 依赖闭包。
- 调整 Explore 与 Apply 模板，改用 `changelog.md` 定位历史，再按需读取对应 archive；不再调用语义搜索。
- 更新中英文 README、架构说明和生成产物，删除对当前 search/QMD 功能的宣称。
- 保留 `marchen/archive/` 与 `marchen/changelog.md` 中的历史事实记录。
- 不自动删除项目中遗留的 `.search` 索引或用户全局 QMD 模型缓存；继续忽略 `.search/`，并提供可选的手动清理说明。

## 能力

### 新增能力

- `search-retirement-migration`：完整退役项目内 search/QMD 能力，并让新旧工作区安全迁移到基于 changelog 与 archive 的确定性历史调查路径。

### 修改能力

- 无。

## 影响范围

- `apps/cli`：命令注册、init/update 流程、模型进度工具、依赖与构建配置。
- `packages/core`：SearchManager、QMD 模型模块、Workspace 配置与路径、ChangeManager archive 生命周期及公共导出。
- `packages/shared`：WorkspaceConfig 搜索/模型字段与 HuggingFace 默认端点常量。
- `packages/config`：Explore/Apply Skill 与 Command 模板、codegen 生成常量。
- 仓库生成文件与文档：`.agents/`、`.claude/`、README、AGENTS/CLAUDE 包级说明。
- 依赖与测试：`pnpm-lock.yaml`、CLI/Core/Config/Shared 测试及旧工作区迁移验证。
