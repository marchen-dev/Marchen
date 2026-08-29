## 动机

用户与 AI 探讨一个想法时，常常还没有准备好立即进入 lite 或完整 propose 流程。当前 explore 只能停留在当次对话中；对话结束后，已确认的背景、倾向、否决方案和待确认问题缺少轻量、可靠的承载方式。直接把这些内容写进正式 change 会过早承诺实施，而依赖 QMD 搜索又不符合后续准备退役项目内 QMD 的方向。

需要在“临时对话”和“正式变更”之间增加一个可暂停、可恢复、可晋升的 idea 层，并由 CLI 提供确定性的存储和生命周期操作，由 Skill 负责语义理解与内容提炼。

## 变更内容

- 新增 `marchen/ideas/<name>.md` 作为尚未晋升的想法存储区，默认作为普通项目文件进入 Git，但 CLI 不执行 Git add 或 commit。
- 新增 `marchen idea` CLI 命令组，支持列举、读取、创建、带修订保护的更新、删除，以及把一个或多个 idea 晋升到 open change 的 `exploration/` 目录。
- 新增 IdeaManager，统一处理 idea 名称、元数据、Markdown 格式、异常文件降级、并发更新和安全迁移。
- 新增 `marchen-capture` Skill，将当前探索提炼为结构化 idea，而不是保存原始聊天记录。
- 更新 `marchen-explore`，通过 CLI 读取轻量 idea 元数据并由 AI 做语义匹配；不使用 QMD、embedding 或数值相关度阈值。
- 更新 `marchen-propose` 与 `marchen-lite`，支持从显式指定的 idea 创建正式变更，并在规划产物验证完成后调用 CLI 晋升原始 idea。
- 保持 proposal/specs/design/tasks 为正式变更的真相源；晋升后的 exploration 文件只保留探索背景。
- QMD 与现有 `marchen search` 的整体退役不纳入本变更。

## 能力

### 新增能力

- `idea-lifecycle-management`：通过 Core 与 CLI 对 idea 执行结构化列举、读取、创建、更新、删除和可靠晋升。
- `idea-workflow-integration`：让 capture、explore、propose 与 lite Skill 使用 idea 生命周期，在临时探索和正式变更之间衔接。

### 修改能力

- 无。

## 影响范围

- `packages/shared`：新增 idea 相关类型与常量。
- `packages/fs`：补充文本解析、排他写入或安全文件迁移所需的文件操作能力。
- `packages/core`：新增 IdeaManager，并扩展 Workspace 的 ideas 路径和初始化行为。
- `apps/cli`：注册 `marchen idea` 命令组并向 CLI context 暴露 IdeaManager。
- `packages/config`：新增 capture Skill/Command 模板，调整 explore、propose、lite 模板并重新生成模板常量。
- 测试与 README：覆盖 CLI/Core 生命周期、异常和迁移行为，并说明新的工作流入口。
